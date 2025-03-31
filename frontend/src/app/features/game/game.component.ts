// Update the game.component.ts file to include the new modal components

// In src/app/features/game/game.component.ts - update the imports section
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { WebSocketService } from "../../core/services/websocket.service";
import { Subscription } from "rxjs";
import { AuthService } from "../../core/services/auth.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RoomService } from "../../core/services/room.service";
import { VictoryModalComponent } from "./victory-modal/victory-modal.component";
import { DefeatModalComponent } from "./defeat-modal/defeat-modal.component";

@Component({
  selector: "app-game",
  standalone: true,
  imports: [CommonModule, FormsModule, VictoryModalComponent, DefeatModalComponent],
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.css"],
})
export class GameComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild("gameplayChat") gameplayChatElement!: ElementRef
  @ViewChild("freeChat") freeChatElement!: ElementRef

  roomId!: number
  gameplayMessages: any[] = []
  freeChatMessages: any[] = []
  questionInput = ""
  freeChatInput = ""
  gameplaySubscription!: Subscription
  freeChatSubscription!: Subscription
  matchUpdatesSubscription!: Subscription
  playerId: string | null = null
  playerName = ""
  opponentName = "Opponent"
  opponentId: string | null = null

  // Character information - using placeholders instead of service
  myCharacter: any = { name: "YOUR CHARACTER" }
  opponentCharacter: any = { name: "MYSTERY CHARACTER" }

  // Yes/No validation
  yesNoRegex = /^(yes|no|maybe)$/i
  invalidYesNoMessage = false

  // Game state
  isGuessing = false
  guessInput = ""
  gameEnded = false
  winner: string | null = null
  gameId: number | null = null

  // New properties for victory/defeat modals
  showVictoryModal = false;
  showDefeatModal = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private roomService: RoomService,
    private webSocketService: WebSocketService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.roomId = Number.parseInt(this.route.snapshot.paramMap.get("id") || "0", 10)
    const userId = this.authService.getCurrentUserId()
    this.playerName = this.authService.getCurrentUser()?.username || "Player"

    if (userId) {
      this.playerId = userId.toString()
      console.log("Player ID:", this.playerId)
      console.log("Room ID:", this.roomId)

      // Get room information to find opponent
      this.getRoomInfo()

      this.webSocketService
        .connect(this.playerId, this.roomId)
        .then(() => {
          // Subscribe to gameplay messages
          this.gameplaySubscription = this.webSocketService.subscribe(`/topic/room/${this.roomId}/gameplay`).subscribe({
            next: (message: any) => {
              // Only add messages that have content and sender info
              if (message.content && message.sender) {
                const senderName = message.sender === this.playerId ? this.playerName : this.opponentName
                this.gameplayMessages.push({
                  ...message,
                  senderName,
                })
                this.scrollToBottom("gameplay")
              }
            },
            error: (error) => console.error("Gameplay subscription error:", error),
          })

          // Make sure to unsubscribe from any existing subscription first
          if (this.freeChatSubscription) {
            this.freeChatSubscription.unsubscribe()
          }

          // Subscribe to free chat messages
          this.freeChatSubscription = this.webSocketService.subscribe(`/topic/room/${this.roomId}/free`).subscribe({
            next: (message: any) => {
              // Make sure this is a FREE_CHAT type message
              if (message.type === "FREE_CHAT") {
                const senderName = message.sender === this.playerId ? this.playerName : this.opponentName
                this.freeChatMessages.push({
                  ...message,
                  senderName,
                })
                this.scrollToBottom("free")
              }
              // Handle system messages
              else if (message.type === "SYSTEM_MESSAGE") {
                // Handle victory claim
                if (message.content.startsWith("VICTORY_CLAIMED:")) {
                  const winnerName = message.content.substring("VICTORY_CLAIMED:".length);

                  // Only process if this is from the opponent
                  if (message.sender !== this.playerId) {
                    // Don't end the game, just notify
                    this.addSystemMessage(`${winnerName} has claimed victory in this match!`);
                    this.addSystemMessage(`You can either concede defeat or claim your own victory.`);
                  }
                }
                // Handle concession
                else if (message.content.startsWith("DEFEAT_CONCEDED:")) {
                  const parts = message.content.split(":");
                  const loserName = parts[1];
                  const winnerName = parts[2];

                  // Only process if this is from the opponent
                  if (message.sender !== this.playerId) {
                    // Don't end the game, just notify
                    this.addSystemMessage(`${loserName} has conceded defeat. You are the winner!`);
                    this.addSystemMessage(`You can claim your victory to officially end the match.`);
                  }
                }
              }
            },
            error: (error) => console.error("Free chat subscription error:", error),
          })

          // Subscribe to match updates
          this.matchUpdatesSubscription = this.webSocketService.subscribe("/topic/match-updates").subscribe({
            next: (message: any) => {
              console.log("Match update received:", message)
            },
            error: (error) => console.error("Match updates subscription error:", error),
          })

          // Load character info
          this.setupCharacters()
        })
        .catch((error) => {
          console.error("WebSocket connection error:", error)
        })
    } else {
      console.error("No user ID available")
      this.router.navigate(["/login"])
    }
  }

  // Update the claimVictory method
  async claimVictory() {
    if (this.gameEnded || !this.opponentId) return

    try {
      // First create game with current player as winner
      const response = await this.webSocketService.completeGame(
        this.roomId,
        this.playerId!, // current player is winner
        this.opponentId,
      )

      this.gameId = response.id
      this.gameEnded = true
      this.winner = this.playerName
      this.addSystemMessage(`You claimed victory! Game recorded.`)

      // Notify opponent
      await this.webSocketService.sendChatMessage(
        `GAME_COMPLETED:${this.playerName}`,
        "SYSTEM_MESSAGE",
        this.playerId!,
        this.roomId,
      )

      // Show victory modal
      this.showVictoryModal = true
    } catch (error) {
      console.error("Failed to complete game:", error)
      this.addSystemMessage("Failed to record game result. Please try again.")
    }
  }

  // Update the concedeDefeat method
  async concedeDefeat() {
    if (this.gameEnded || !this.opponentId) return

    try {
      // First create game with opponent as winner
      const response = await this.webSocketService.completeGame(
        this.roomId,
        this.opponentId, // opponent is winner
        this.playerId!, // current player is loser
      )

      this.gameId = response.id
      this.gameEnded = true
      this.winner = this.opponentName
      this.addSystemMessage(`You conceded defeat. ${this.opponentName} wins!`)

      // Notify opponent
      await this.webSocketService.sendChatMessage(
        `GAME_COMPLETED:${this.opponentName}`,
        "SYSTEM_MESSAGE",
        this.playerId!,
        this.roomId,
      )

      // Show defeat modal
      this.showDefeatModal = true
    } catch (error) {
      console.error("Failed to complete game:", error)
      this.addSystemMessage("Failed to record game result. Please try again.")
    }
  }

  // Keep all other existing methods
  getRoomInfo() {
    // Use the existing roomService to get information about the room
    // This replaces the character service functionality
    if (this.roomService.getRoomUsers) {
      this.roomService.getRoomUsers(this.roomId).subscribe({
        next: (users) => {
          console.log("Room users:", users)

          // Find opponent (any user that's not the current player)
          const opponent = users.find((u) => u.userId.toString() !== this.playerId)
          if (opponent) {
            this.opponentId = opponent.userId.toString()
            this.opponentName = opponent.username || opponent.name || "Opponent"
          }
        },
        error: (err) => console.error("Failed to get room users:", err),
      })
    }
  }

  sendGameplayQuestion() {
    if (this.questionInput.trim() && this.playerId) {
      // Check if it's a valid yes/no question (this is just a basic check)
      if (!this.questionInput.trim().endsWith("?")) {
        this.invalidYesNoMessage = true
        setTimeout(() => (this.invalidYesNoMessage = false), 3000)
        return
      }

      this.webSocketService.sendChatMessage(this.questionInput, "GAMEPLAY_CHAT", this.playerId, this.roomId)

      this.questionInput = ""
    }
  }

  sendFreeChatMessage() {
    if (this.freeChatInput.trim() && this.playerId) {
      this.webSocketService.sendChatMessage(this.freeChatInput, "FREE_CHAT", this.playerId, this.roomId)

      this.freeChatInput = ""
    }
  }

  sendYesNoAnswer(answer: "yes" | "no" | "maybe") {
    if (this.playerId) {
      this.webSocketService.sendChatMessage(answer, "GAMEPLAY_CHAT", this.playerId, this.roomId)
    }
  }

  makeGuess() {
    if (this.guessInput.trim() && this.playerId) {
      this.webSocketService.sendChatMessage(`GUESS: ${this.guessInput}`, "GAME_STATE", this.playerId, this.roomId)

      // Also send as a gameplay message for visibility
      this.webSocketService.sendChatMessage(
        `I guess the character is: ${this.guessInput}`,
        "GAMEPLAY_CHAT",
        this.playerId,
        this.roomId,
      )

      this.guessInput = ""
      this.isGuessing = false
    }
  }

  toggleGuessMode() {
    this.isGuessing = !this.isGuessing
  }

  leaveGame() {
    if (confirm("Are you sure you want to leave the game?")) {
      const playerId = this.authService.getCurrentUserId()
      if (playerId) {
        // Send WebSocket message first
        this.webSocketService.sendLeaveRoomMessage(this.roomId, playerId.toString())

        this.roomService.leaveRoom(this.roomId, playerId).subscribe({
          next: () => {
            console.log("Left room:", this.roomId)
            this.webSocketService.disconnect()
            this.router.navigate(["/rooms"])
          },
          error: (err) => console.error("Failed to leave room:", err),
        })
      }
    }
  }

  scrollToBottom(chatType: "gameplay" | "free") {
    setTimeout(() => {
      if (chatType === "gameplay" && this.gameplayChatElement) {
        this.gameplayChatElement.nativeElement.scrollTop = this.gameplayChatElement.nativeElement.scrollHeight
      } else if (chatType === "free" && this.freeChatElement) {
        this.freeChatElement.nativeElement.scrollTop = this.freeChatElement.nativeElement.scrollHeight
      }
    }, 100)
  }

  ngAfterViewChecked() {
    this.scrollToBottom("gameplay")
    this.scrollToBottom("free")
  }

  ngOnDestroy() {
    if (this.gameplaySubscription) {
      this.gameplaySubscription.unsubscribe()
    }
    if (this.freeChatSubscription) {
      this.freeChatSubscription.unsubscribe()
    }
    if (this.matchUpdatesSubscription) {
      this.matchUpdatesSubscription.unsubscribe()
    }

    // Ensure we disconnect from WebSocket
    this.webSocketService.disconnect()
  }

  // Helper method to get initials for avatar
  getInitials(name: string): string {
    return name ? name.charAt(0).toUpperCase() : "?"
  }

  // Helper to get random color based on user ID (for consistent colors)
  getAvatarColor(userId: string | undefined | null): string {
    if (!userId) return "from-gray-600 to-gray-800" // Default color

    const colors = [
      "from-red-600 to-red-800",
      "from-blue-600 to-blue-800",
      "from-green-600 to-green-800",
      "from-purple-600 to-purple-800",
      "from-yellow-600 to-yellow-800",
      "from-pink-600 to-pink-800",
    ]

    const hash = userId.split("").reduce((acc, char) => {
      return acc + char.charCodeAt(0)
    }, 0)

    return colors[hash % colors.length]
  }

  addSystemMessage(message: string) {
    this.freeChatMessages.push({
      type: "SYSTEM_MESSAGE",
      content: message,
      timestamp: new Date(),
      senderName: "System",
    })
    this.scrollToBottom("free")
  }

  setupCharacters() {
    // For now using placeholder data
    // In a real implementation, you would fetch this from a service
    this.myCharacter = {
      name: this.playerName + "'s Character",
      // Add other character properties as needed
    }

    this.opponentCharacter = {
      name: "Mystery Character",
      // Add other character properties as needed
    }

    console.log("Characters initialized:", this.myCharacter, this.opponentCharacter)
  }
}


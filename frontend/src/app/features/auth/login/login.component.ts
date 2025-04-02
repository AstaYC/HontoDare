import { Component } from "@angular/core"
import {  Router, RouterLink } from "@angular/router"
import  { AuthService } from "../../../core/services/auth.service"
import { FormsModule } from "@angular/forms"
import { HttpClientModule } from "@angular/common/http"
import { NgIf } from "@angular/common"
import  { TokenService } from "../../../core/services/token.service"

@Component({
  selector: "app-login",
  standalone: true,
  imports: [RouterLink, FormsModule, HttpClientModule, NgIf],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent {
  email = ""
  password = ""
  errorMessage = ""
  successMessage = ""

  constructor(
    private authService: AuthService,
    private router: Router,
    private tokenService: TokenService,
  ) {}

  login() {

    this.errorMessage = ""
    this.successMessage = ""

    if (!this.email || !this.password) {
      this.errorMessage = "All fields are required"
      return
    }

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        if (response) {
          this.successMessage = "Login successful"
          this.tokenService.saveToken(response)

          setTimeout(() => {
            if (this.tokenService.getUserRole() == "ADMIN") {
              this.router.navigate(["/admin/users"])
            } else if (this.tokenService.getUserRole() === "MODERATOR") {
              this.router.navigate(["/home"])
            } else {
              this.router.navigate(["/home"])
            }
          }, 1000)
        } else {
          this.errorMessage = "Login failed. Please check your credentials"
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || "Login failed. Please check your credentials"
        console.error("Login failed", error)
      },
    })
  }
}


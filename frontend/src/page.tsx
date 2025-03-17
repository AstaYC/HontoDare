// import { Button } from "@/components/ui/button"
// import { Sword, ChevronRight } from "lucide-react"
// import Link from "next/link"
//
// export default function HomePage() {
//   return (
//     <div className="min-h-screen bg-black text-white">
//       {/* Navigation Bar */}
//       <header className="main-menu">
//         <div className="container mx-auto px-4">
//           <div className="flex items-center justify-between py-4">
//             <Link href="/" className="navbar-brand">
//               <h1 className="font-kill-the-noise text-3xl text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 transform -skew-x-12">
//                 HontoDare
//               </h1>
//             </Link>
//
//             <nav className="hidden md:flex">
//               <ul className="flex space-x-8">
//                 <li>
//                   <Link href="/" className="text-white hover:text-red-500 transition-colors">
//                     Home
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="/fighter" className="text-white hover:text-red-500 transition-colors">
//                     Fighter
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="/team" className="text-white hover:text-red-500 transition-colors">
//                     Team
//                   </Link>
//                 </li>
//                 <li className="relative group">
//                   <Link href="/blog" className="text-white hover:text-red-500 transition-colors flex items-center">
//                     Blog{" "}
//                     <ChevronRight className="h-4 w-4 ml-1 transform rotate-90 group-hover:rotate-0 transition-transform" />
//                   </Link>
//                   <div className="absolute left-0 mt-2 w-48 bg-gray-900 border border-red-900 shadow-lg hidden group-hover:block z-10">
//                     <Link href="/blog" className="block px-4 py-2 text-white hover:bg-red-900 transition-colors">
//                       Blog
//                     </Link>
//                     <Link href="/single-blog" className="block px-4 py-2 text-white hover:bg-red-900 transition-colors">
//                       Single Blog
//                     </Link>
//                   </div>
//                 </li>
//                 <li className="relative group">
//                   <Link href="#" className="text-white hover:text-red-500 transition-colors flex items-center">
//                     Pages{" "}
//                     <ChevronRight className="h-4 w-4 ml-1 transform rotate-90 group-hover:rotate-0 transition-transform" />
//                   </Link>
//                   <div className="absolute left-0 mt-2 w-48 bg-gray-900 border border-red-900 shadow-lg hidden group-hover:block z-10">
//                     <Link href="/elements" className="block px-4 py-2 text-white hover:bg-red-900 transition-colors">
//                       Elements
//                     </Link>
//                   </div>
//                 </li>
//                 <li>
//                   <Link href="/contact" className="text-white hover:text-red-500 transition-colors">
//                     Contact
//                   </Link>
//                 </li>
//               </ul>
//             </nav>
//
//             <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-none">
//               Profile
//             </Button>
//
//             <button className="md:hidden text-white">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-6 w-6"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//               </svg>
//             </button>
//           </div>
//         </div>
//       </header>
//
//       {/* Hero Section */}
//       <section className="relative overflow-hidden">
//         <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1600')] bg-cover bg-center opacity-10"></div>
//         {/* Red slash decorations */}
//         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
//           <div className="absolute -top-20 -left-20 w-96 h-96 bg-red-600 rotate-12 opacity-20"></div>
//           <div className="absolute top-40 right-0 w-72 h-72 bg-red-700 -rotate-12 opacity-20"></div>
//           <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-red-800 rotate-45 opacity-10"></div>
//         </div>
//
//         <div className="container mx-auto px-4 py-32 relative z-10">
//           <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
//             <div className="relative">
//               <h1 className="font-kill-the-noise text-6xl md:text-7xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 transform -skew-x-12">
//                 HontoDare
//               </h1>
//               <div className="absolute -top-6 -right-6">
//                 <Sword className="h-12 w-12 text-red-600 animate-pulse" />
//               </div>
//               <div className="h-1 w-48 mx-auto bg-red-600 mb-6 transform -skew-x-12"></div>
//             </div>
//             <p className="text-xl md:text-2xl mb-8 text-gray-300 font-semibold tracking-wide">
//               THE ULTIMATE CHARACTER GUESSING BATTLEGROUND
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4">
//               <Button
//                 size="lg"
//                 className="bg-gradient-to-r from-red-800 to-red-600 hover:from-red-900 hover:to-red-700 text-white border-0 rounded-none px-8 py-6 text-lg font-bold tracking-wider transform hover:translate-y-[-2px] transition-transform"
//               >
//                 PLAY NOW
//                 <ChevronRight className="ml-2 h-5 w-5" />
//               </Button>
//               <Button
//                 size="lg"
//                 variant="outline"
//                 className="border-red-600 text-red-500 hover:bg-red-900/30 rounded-none px-8 py-6 text-lg font-bold tracking-wider"
//               >
//                 HOW TO PLAY
//               </Button>
//             </div>
//           </div>
//         </div>
//
//         {/* Floating characters */}
//         <div className="absolute top-20 left-10 animate-float-slow hidden lg:block">
//           <div className="w-24 h-24 rounded-full bg-gradient-to-r from-red-800 to-red-600 shadow-lg shadow-red-900/50 flex items-center justify-center">
//             <img src="/placeholder.svg?height=80&width=80" alt="Character" className="rounded-full" />
//           </div>
//         </div>
//         <div className="absolute bottom-20 right-10 animate-float hidden lg:block">
//           <div className="w-32 h-32 rounded-full bg-gradient-to-r from-red-600 to-red-500 shadow-lg shadow-red-900/50 flex items-center justify-center">
//             <img src="/placeholder.svg?height=100&width=100" alt="Character" className="rounded-full" />
//           </div>
//         </div>
//       </section>
//
//       {/* How to Play Section */}
//       <section className="py-20 bg-gradient-to-b from-black to-gray-900 relative">
//         <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1600')] bg-cover bg-center opacity-5"></div>
//         <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
//
//         <div className="container mx-auto px-4 relative z-10">
//           <h2 className="font-kill-the-noise text-4xl text-center mb-4 text-red-500 transform -skew-x-12">
//             How To Play
//           </h2>
//           <div className="h-1 w-32 mx-auto bg-red-600 mb-6"></div>
//           <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
//             HontoDare is simple to learn but challenging to master!
//           </p>
//
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {steps.map((step, index) => (
//               <div
//                 key={index}
//                 className="flex flex-col items-center text-center p-6 bg-gray-900/80 border border-gray-800 hover:border-red-900 transition-all duration-300 group"
//               >
//                 <div className="w-12 h-12 bg-gradient-to-r from-red-800 to-red-600 flex items-center justify-center mb-4 text-xl font-bold transform -skew-x-12 group-hover:skew-x-0 transition-transform duration-300">
//                   {index + 1}
//                 </div>
//                 <div className="mb-4 text-red-500">{step.icon}</div>
//                 <h3 className="font-kill-the-noise text-xl mb-2 group-hover:text-red-500 transition-colors duration-300">
//                   {step.title}
//                 </h3>
//                 <p className="text-gray-400">{step.description}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//
//       {/* Features Section */}
//       <section className="py-20 container mx-auto px-4 relative">
//         <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-600 opacity-10 transform -rotate-12"></div>
//
//         <h2 className="font-kill-the-noise text-4xl text-center mb-4 text-red-500 transform -skew-x-12">
//           Game Features
//         </h2>
//         <div className="h-1 w-32 mx-auto bg-red-600 mb-16"></div>
//
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
//           {features.map((feature, index) => (
//             <div
//               key={index}
//               className="flex flex-col items-center text-center p-8 bg-gray-900/50 border border-gray-800 hover:border-red-700 transition-all duration-300 group"
//             >
//               <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
//                 {feature.icon}
//               </div>
//               <h3 className="font-kill-the-noise text-xl mb-3 group-hover:text-red-500 transition-colors duration-300">
//                 {feature.title}
//               </h3>
//               <p className="text-gray-400">{feature.description}</p>
//             </div>
//           ))}
//         </div>
//       </section>
//
//       {/* CTA Section */}
//       <section className="py-20 bg-gradient-to-r from-red-900 to-black relative">
//         <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=1600')] bg-cover bg-center opacity-10"></div>
//         <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
//
//         <div className="container mx-auto px-4 text-center relative z-10">
//           <h2 className="font-kill-the-noise text-4xl mb-6 text-red-500 transform -skew-x-12">Ready For Battle?</h2>
//           <div className="h-1 w-32 mx-auto bg-red-600 mb-6"></div>
//           <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
//             Join thousands of players already guessing characters across different universes!
//           </p>
//           <Button
//             size="lg"
//             className="bg-gradient-to-r from-red-800 to-red-600 hover:from-red-900 hover:to-red-700 text-white border-0 rounded-none px-10 py-7 text-xl font-bold tracking-wider transform hover:translate-y-[-2px] transition-transform"
//           >
//             START PLAYING NOW
//           </Button>
//         </div>
//       </section>
//
//       {/* Footer */}
//       <footer className="bg-black py-10 border-t border-red-900">
//         <div className="container mx-auto px-4">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
//             <div>
//               <h2 className="font-kill-the-noise text-2xl text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 transform -skew-x-12 mb-4">
//                 HontoDare
//               </h2>
//               <p className="text-gray-400">
//                 Heaven fruitful doesn't over lesser days appear creeping seasons so behold bearing days open
//               </p>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Contact Info</h4>
//               <p className="text-gray-400 mb-2">Address: Your address goes here, your demo address.</p>
//               <p className="text-gray-400 mb-2">Phone: +8880 44338899</p>
//               <p className="text-gray-400">Email: info@hontodare.com</p>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Important Links</h4>
//               <ul className="text-gray-400 space-y-2">
//                 <li>
//                   <Link href="#" className="hover:text-red-500 transition-colors">
//                     My Account
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="#" className="hover:text-red-500 transition-colors">
//                     Game Rules
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="#" className="hover:text-red-500 transition-colors">
//                     Leaderboards
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="#" className="hover:text-red-500 transition-colors">
//                     Support
//                   </Link>
//                 </li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Newsletter</h4>
//               <p className="text-gray-400 mb-4">
//                 Subscribe to our newsletter for updates on new features and characters.
//               </p>
//               <div className="flex">
//                 <input type="email" placeholder="Email Address" className="bg-gray-800 text-white px-4 py-2 w-full" />
//                 <button className="bg-red-600 text-white px-4">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                     <path
//                       fillRule="evenodd"
//                       d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 </button>
//               </div>
//             </div>
//           </div>
//           <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800">
//             <div className="text-gray-500 text-sm">© {new Date().getFullYear()} HontoDare. All rights reserved.</div>
//             <div className="flex space-x-4 mt-4 md:mt-0">
//               <Link href="#" className="text-gray-400 hover:text-red-500 transition-colors">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
//                   <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
//                 </svg>
//               </Link>
//               <Link href="#" className="text-gray-400 hover:text-red-500 transition-colors">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
//                   <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
//                 </svg>
//               </Link>
//               <Link href="#" className="text-gray-400 hover:text-red-500 transition-colors">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
//                   <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
//                 </svg>
//               </Link>
//               <Link href="#" className="text-gray-400 hover:text-red-500 transition-colors">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
//                   <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2.917 16.083c-2.258 0-4.083-1.825-4.083-4.083s1.825-4.083 4.083-4.083c1.103 0 2.024.402 2.735 1.067l-1.107 1.068c-.304-.292-.834-.63-1.628-.63-1.394 0-2.531 1.155-2.531 2.579 0 1.424 1.138 2.579 2.531 2.579 1.616 0 2.224-1.162 2.316-1.762h-2.316v-1.4h3.855c.036.204.064.408.064.677.001 2.332-1.563 3.988-3.919 3.988zm9.917-3.5h-1.75v1.75h-1.167v-1.75h-1.75v-1.166h1.75v-1.75h1.167v1.75h1.75v1.166z" />
//                 </svg>
//               </Link>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   )
// }
//
// // Sample data
// const steps = [
//   {
//     icon: (
//       <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           strokeWidth={2}
//           d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
//         />
//       </svg>
//     ),
//     title: "Join a Room",
//     description: "Select a themed room that matches your interests and knowledge.",
//   },
//   {
//     icon: (
//       <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           strokeWidth={2}
//           d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
//         />
//       </svg>
//     ),
//     title: "Upload Character",
//     description: "Choose a character for your opponent to guess.",
//   },
//   {
//     icon: (
//       <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           strokeWidth={2}
//           d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
//         />
//       </svg>
//     ),
//     title: "Ask Questions",
//     description: "Take turns asking yes/no questions to identify the character.",
//   },
//   {
//     icon: (
//       <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           strokeWidth={2}
//           d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
//         />
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//       </svg>
//     ),
//     title: "Make Your Guess",
//     description: "First to correctly guess the opponent's character wins!",
//   },
// ]
//
// const features = [
//   {
//     icon: (
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         className="h-12 w-12 text-red-500"
//         fill="none"
//         viewBox="0 0 24 24"
//         stroke="currentColor"
//       >
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           strokeWidth={2}
//           d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
//         />
//       </svg>
//     ),
//     title: "Smart Matchmaking",
//     description: "Get paired with players who share your interests for the most engaging matches.",
//   },
//   {
//     icon: (
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         className="h-12 w-12 text-red-500"
//         fill="none"
//         viewBox="0 0 24 24"
//         stroke="currentColor"
//       >
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           strokeWidth={2}
//           d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
//         />
//       </svg>
//     ),
//     title: "Dual Chat System",
//     description: "Dedicated yes/no guessing chat plus a free chat for discussions.",
//   },
//   {
//     icon: (
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         className="h-12 w-12 text-red-500"
//         fill="none"
//         viewBox="0 0 24 24"
//         stroke="currentColor"
//       >
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           strokeWidth={2}
//           d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
//         />
//       </svg>
//     ),
//     title: "Competitive Ranking",
//     description: "Climb the leaderboards and show off your character knowledge!",
//   },
// ]
//

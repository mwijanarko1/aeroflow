import './globals.css'
import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { AuthProvider } from './contexts/AuthContext'
import AuthButton from './components/AuthButton'
import Link from 'next/link'
// import Link from 'next/link'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins'
})

export const metadata: Metadata = {
  title: 'AeroFlow - Advanced Airfoil Analysis Tool',
  description: 'Web-based tool for generating and analyzing airfoil geometries',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <header className="bg-white shadow-md">
              <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <a href="/" className="flex items-center hover:opacity-90 transition-opacity">
                      <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4L3 9L12 14L21 9L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 14L12 19L21 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <h1 className="ml-2 text-2xl font-bold text-gray-900 font-poppins bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">AeroFlow</h1>
                    </a>
                  </div>
                  <div className="flex items-center gap-6">
                    <nav className="flex items-center gap-6">
                      <Link href="/documentation" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Documentation</Link>
                    </nav>
                    <AuthButton />
                  </div>
                </div>
              </div>
            </header>
            <main>
              <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
            <footer className="bg-white mt-auto shadow-inner">
              <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <p className="text-sm text-gray-500">
                    © {new Date().getFullYear()} AeroFlow. Version 1.0.0
                  </p>
                  <div className="flex space-x-6 mt-4 md:mt-0">
                    <a href="/terms" className="text-gray-500 hover:text-blue-600 transition-colors">Terms</a>
                    <a href="/privacy" className="text-gray-500 hover:text-blue-600 transition-colors">Privacy</a>
                    <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Contact</a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
} 
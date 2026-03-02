import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { keycloak, keycloakConfigParams } from "./keycloak"

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  user: string | undefined
  login: () => void
  logout: () => void
  register: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

let keycloakInitialized = false

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<string | undefined>(undefined)

  const updateAuthState = () => {
    setIsAuthenticated(keycloak.authenticated ?? false)
    if (keycloak.token) {
      try {
        const payload = JSON.parse(atob(keycloak.token.split(".")[1]))
        setUser(payload.preferred_username || payload.sub)
      } catch (e) {
        console.error("Failed to parse token:", e)
      }
    }
  }

  useEffect(() => {
    if (keycloakInitialized) {
      updateAuthState()
      setIsLoading(false)
      return
    }

    keycloakInitialized = true

    const initKeycloak = async () => {
      try {
        const authenticated = await keycloak.init(keycloakConfigParams)
        setIsAuthenticated(authenticated)
        if (authenticated) {
          updateAuthState()
        }
      } catch (err) {
        console.error("Keycloak init error:", err)
        setError(err instanceof Error ? err.message : "Failed to initialize Keycloak")
      } finally {
        setIsLoading(false)
      }
    }

    initKeycloak()

    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).then(updateAuthState).catch(() => {
        keycloak.logout()
      })
    }

    keycloak.onAuthSuccess = updateAuthState
    keycloak.onAuthRefreshSuccess = updateAuthState

    keycloak.onAuthError = (error) => {
      console.error("Keycloak auth error:", error)
      setError("Authentication failed")
    }

    const tokenInterval = setInterval(() => {
      if (keycloak.authenticated) {
        keycloak.updateToken(30).catch(() => {
          keycloak.logout()
        })
      }
    }, 60000)

    return () => clearInterval(tokenInterval)
  }, [])

  const login = () => {
    keycloak.login()
  }

  const logout = () => {
    keycloak.logout({ redirectUri: window.location.origin })
  }

  const register = () => {
    keycloak.register()
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        error,
        user,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

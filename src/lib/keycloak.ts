import Keycloak from "keycloak-js"

const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8080",
  realm: import.meta.env.VITE_KEYCLOAK_REALM || "exim-rag",
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "exim-rag-frontend-main",
}

export const keycloak = new Keycloak(keycloakConfig)

export const keycloakConfigParams = {
  onLoad: "check-sso" as const,
  pkceMethod: "S256" as const,
  checkLoginIframe: false,
  responseMode: "query" as const,
}

export default keycloak

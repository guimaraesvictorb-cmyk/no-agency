"use client"

import { createContext, useContext, useState, useEffect } from "react"

export type SelectedClient = {
  id: string
  name: string
  plan: string
  status: string
} | null

type ClientContextType = {
  client: SelectedClient
  setClient: (c: SelectedClient) => void
}

const ClientContext = createContext<ClientContextType>({
  client: null,
  setClient: () => {},
})

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [client, setClientState] = useState<SelectedClient>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("noagency_client")
      if (stored) setClientState(JSON.parse(stored))
    } catch {}
  }, [])

  function setClient(c: SelectedClient) {
    setClientState(c)
    if (c) localStorage.setItem("noagency_client", JSON.stringify(c))
    else localStorage.removeItem("noagency_client")
  }

  return (
    <ClientContext.Provider value={{ client, setClient }}>
      {children}
    </ClientContext.Provider>
  )
}

export const useSelectedClient = () => useContext(ClientContext)

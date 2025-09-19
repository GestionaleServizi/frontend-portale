// src/pages/UtentiPage.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Box,
  Flex,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  HStack,
  Input,
  Select,
  useToast,
  Image,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

type Utente = {
  id: number;
  email: string;
  ruolo: string;
  cliente_id?: number;
};

type Cliente = {
  id: number;
  nome_sala: string;
};

export default function UtentiPage() {
  const { token, logout } = useAuth();
  const [utenti, setUtenti] = useState<Utente[]>([]);
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [email, setEmail] = useState("");
  const [ruolo, setRuolo] = useState("operatore");
  const [clienteId, setClienteId] = useState<number | "">("");
  const toast = useToast();
  const nav = useNavigate();

  // Carica dati
  const loadData = async () => {
    try {
      const [uteRes, cliRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/utenti`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/clienti`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setUtenti(await uteRes.json());
      setClienti(await cliRes.json());
    } catch {
      toast({ title: "Errore caricamento dati", status: "error" });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Aggiungi utente
  const aggiungiUtente = async () => {
    if (!email) {
      toast({ title: "Email obbligatoria", status: "warning" });
      return;
    }

    const payload: any = { email, ruolo };
    if (ruolo === "operatore") {
      if (!clienteId) {
        toast({ title: "Seleziona un cliente per l’operatore", status: "warning" });
        return;
      }
      payload.cliente_id = clienteId;
    }

    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/utenti`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      toast({ title: "Utente aggiunto", status: "success" });
      setEmail("");
      setRuolo("operatore");
      setClienteId("");
      loadData();
    } catch {
      toast({ title: "Errore aggiunta utente", status: "error" });
    }
  };

  // Elimina utente
  const eliminaUtente = async (id: number) => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/utenti/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "Utente eliminato", status: "info" });
      loadData();
    } catch {
      toast({ title: "Errore eliminazione utente", status: "error" });
    }
  };

  return (
    <Flex minH="100vh" bg="gray.50" direction="column" p={8}>
      {/* Header con logo e bottoni */}
      <Flex justify="space-between" align="center" mb={6}>
        <Box flex="1" textAlign="center">
          <Image src="/servizinet_logo.png" alt="Logo" h="60px" mx="auto" />
        </Box>
        <HStack spacing={4} position="absolute" right="40px">
          <Button colorScheme="blue" onClick={() => nav("/dashboard")}>
            📊 Dashboard
          </Button>
          <Button colorScheme="red" onClick={logout}>
            🚪 Logout
          </Button>
        </HStack>
      </Flex>

      <Heading mb={6}>👥 Gestione Utenti</Heading>

      {/* Form aggiunta */}
      <HStack mb={4} spacing={4}>
        <Input
          placeholder="Email utente"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Select value={ruolo} onChange={(e) => setRuolo(e.target.value)}>
          <option value="operatore">Operatore</option>
          <option value="admin">Admin</option>
        </Select>
        {ruolo === "operatore" && (
          <Select
            placeholder="Seleziona cliente"
            value={clienteId}
            onChange={(e) => setClienteId(Number(e.target.value))}
          >
            {clienti.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome_sala}
              </option>
            ))}
          </Select>
        )}
        <Button colorScheme="green" onClick={aggiungiUtente}>
          ➕ Aggiungi
        </Button>
      </HStack>

      {/* Tabella utenti */}
      <Box bg="white" p={6} borderRadius="lg" shadow="md">
        <Table>
          <Thead>
            <Tr>
              <Th>Email</Th>
              <Th>Ruolo</Th>
              <Th>Cliente</Th>
              <Th>Azioni</Th>
            </Tr>
          </Thead>
          <Tbody>
            {utenti.map((u) => (
              <Tr key={u.id}>
                <Td>{u.email}</Td>
                <Td>{u.ruolo}</Td>
                <Td>
                  {u.cliente_id
                    ? clienti.find((c) => c.id === u.cliente_id)?.nome_sala || "-"
                    : "-"}
                </Td>
                <Td>
                  <Button
                    colorScheme="red"
                    size="sm"
                    onClick={() => eliminaUtente(u.id)}
                  >
                    ❌ Elimina
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Flex>
  );
}

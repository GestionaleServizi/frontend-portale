import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Box,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  Select,
  useToast,
  Image,
  HStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import logo from "./servizinet_logo.png";

type Utente = { id: number; email: string; ruolo: string; cliente_id: number | null };
type Cliente = { id: number; nome_sala: string };

export default function UtentiPage() {
  const { token, logout } = useAuth();
  const [utenti, setUtenti] = useState<Utente[]>([]);
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [email, setEmail] = useState("");
  const [ruolo, setRuolo] = useState("operatore");
  const [clienteId, setClienteId] = useState<number | null>(null);
  const toast = useToast();
  const nav = useNavigate();

  const loadData = async () => {
    try {
      const [uRes, cRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/utenti`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/clienti`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setUtenti(await uRes.json());
      setClienti(await cRes.json());
    } catch {
      toast({ title: "Errore caricamento dati", status: "error" });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const aggiungiUtente = async () => {
    if (!email) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/utenti`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, ruolo, cliente_id: clienteId }),
      });
      if (res.ok) {
        setEmail("");
        setRuolo("operatore");
        setClienteId(null);
        loadData();
      }
    } catch {
      toast({ title: "Errore inserimento", status: "error" });
    }
  };

  const eliminaUtente = async (id: number) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/utenti/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) loadData();
    } catch {
      toast({ title: "Errore eliminazione", status: "error" });
    }
  };

  return (
    <Flex minH="100vh" bg="gray.50" direction="column" p={8}>
      {/* Header con logo e pulsanti */}
      <Flex justify="space-between" align="center" mb={8}>
        <Box flex="1" />
        <Image src={logo} alt="Logo" boxSize="80px" objectFit="contain" />
        <HStack spacing={4} flex="1" justify="flex-end">
          <Button colorScheme="blue" onClick={() => nav("/dashboard")}>
            Dashboard
          </Button>
          <Button colorScheme="red" onClick={logout}>
            Logout
          </Button>
        </HStack>
      </Flex>

      <Heading mb={6}>Gestione Utenti</Heading>

      <Flex mb={4} gap={2}>
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Select value={ruolo} onChange={(e) => setRuolo(e.target.value)}>
          <option value="admin">Admin</option>
          <option value="operatore">Operatore</option>
        </Select>
        <Select
          placeholder="Seleziona Cliente"
          value={clienteId ?? ""}
          onChange={(e) =>
            setClienteId(e.target.value ? Number(e.target.value) : null)
          }
        >
          {clienti.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome_sala}
            </option>
          ))}
        </Select>
        <Button colorScheme="green" onClick={aggiungiUtente}>
          Aggiungi
        </Button>
      </Flex>

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
                    ? clienti.find((c) => c.id === u.cliente_id)?.nome_sala
                    : "-"}
                </Td>
                <Td>
                  <Button
                    colorScheme="red"
                    size="sm"
                    onClick={() => eliminaUtente(u.id)}
                  >
                    Elimina
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

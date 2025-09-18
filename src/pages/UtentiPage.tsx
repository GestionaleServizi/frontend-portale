// src/pages/UtentiPage.tsx
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
  VStack,
  Input,
  Select,
  useToast,
  HStack,
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
  const [ruolo, setRuolo] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const toast = useToast();
  const nav = useNavigate();

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

  const handleSubmit = async () => {
    if (!email || !ruolo) {
      toast({ title: "Compila tutti i campi", status: "warning" });
      return;
    }
    try {
      if (editingId) {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/utenti/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email, ruolo, cliente_id: clienteId || null }),
        });
        toast({ title: "Utente aggiornato", status: "success" });
      } else {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/utenti`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email, ruolo, cliente_id: clienteId || null }),
        });
        toast({ title: "Utente creato", status: "success" });
      }
      setEmail("");
      setRuolo("");
      setClienteId("");
      setEditingId(null);
      loadData();
    } catch {
      toast({ title: "Errore salvataggio utente", status: "error" });
    }
  };

  const handleEdit = (u: Utente) => {
    setEditingId(u.id);
    setEmail(u.email);
    setRuolo(u.ruolo);
    setClienteId(u.cliente_id ? String(u.cliente_id) : "");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Sei sicuro di voler eliminare questo utente?")) return;
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
      {/* Header con logo */}
      <VStack spacing={2} mb={6}>
        <img src="/servizinet_logo.png" alt="Logo" width="120" />
        <Heading size="lg">Gestione Utenti</Heading>
        <HStack spacing={4}>
          <Button colorScheme="blue" onClick={() => nav("/dashboard")}>
            Dashboard
          </Button>
          <Button colorScheme="red" onClick={logout}>
            Logout
          </Button>
        </HStack>
      </VStack>

      {/* Form Utente */}
      <Box bg="white" p={6} borderRadius="lg" shadow="md" mb={6}>
        <VStack spacing={4} align="stretch">
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Select
            placeholder="Seleziona ruolo"
            value={ruolo}
            onChange={(e) => setRuolo(e.target.value)}
          >
            <option value="admin">Admin</option>
            <option value="operatore">Operatore</option>
          </Select>
          <Select
            placeholder="Assegna cliente (solo per operatori)"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
          >
            {clienti.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome_sala}
              </option>
            ))}
          </Select>
          <Button colorScheme="blue" onClick={handleSubmit}>
            {editingId ? "Aggiorna" : "Crea"} Utente
          </Button>
        </VStack>
      </Box>

      {/* Tabella Utenti */}
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
                  {clienti.find((c) => c.id === u.cliente_id)?.nome_sala || "-"}
                </Td>
                <Td>
                  <HStack>
                    <Button size="sm" onClick={() => handleEdit(u)}>
                      Modifica
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDelete(u.id)}
                    >
                      Elimina
                    </Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Flex>
  );
}

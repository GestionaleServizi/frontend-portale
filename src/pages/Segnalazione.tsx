// src/pages/Segnalazione.tsx
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
  Select,
  Input,
  useToast,
  VStack,
} from "@chakra-ui/react";

type Segnalazione = {
  id: number;
  data: string;        // ISO date string
  ora: string;
  descrizione: string;
  categoria?: string;
  sala?: string;
};

type Categoria = { id: number; nome_categoria: string };

export default function Segnalazione() {
  const { token, user, logout } = useAuth();
  const [segnalazioni, setSegnalazioni] = useState<Segnalazione[]>([]);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [filtroData, setFiltroData] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const toast = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [segRes, catRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/segnalazioni`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/categorie`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!segRes.ok || !catRes.ok) throw new Error("fetch failed");

        const segData = await segRes.json();
        const catData = await catRes.json();

        setSegnalazioni(Array.isArray(segData) ? segData : []);
        setCategorie(Array.isArray(catData) ? catData : []);
      } catch {
        toast({ title: "Errore caricamento dati", status: "error" });
      }
    };

    loadData();
  }, [token, toast]);

  const segnalazioniFiltrate = (segnalazioni || []).filter((s) => {
    const dataMatch = filtroData ? s.data?.startsWith(filtroData) : true;
    const catMatch = filtroCategoria ? s.categoria === filtroCategoria : true;
    return dataMatch && catMatch;
  });

  return (
    <Flex minH="100vh" bg="gray.50" direction="column" p={8}>
      {/* Header */}
      <VStack spacing={2} mb={6}>
        <img src="/logo.png" alt="Logo" width="120" />
        <Heading>Nuova Segnalazione</Heading>
        <Text>
          👤 {user?.email} | 🏢 {user?.sala || "N/A"}
        </Text>
        <Button colorScheme="red" size="sm" onClick={logout}>
          Logout
        </Button>
      </VStack>

      {/* Filtri */}
      <HStack mb={4} spacing={4}>
        <Input
          type="date"
          value={filtroData}
          onChange={(e) => setFiltroData(e.target.value)}
        />
        <Select
          placeholder="Tutte le categorie"
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
        >
          {(categorie || []).map((c) => (
            <option key={c.id} value={c.nome_categoria}>
              {c.nome_categoria}
            </option>
          ))}
        </Select>
        <Button
          onClick={() => {
            setFiltroData("");
            setFiltroCategoria("");
          }}
        >
          Reset Filtri
        </Button>
      </HStack>

      {/* Tabella */}
      <Box bg="white" p={6} borderRadius="lg" shadow="md">
        <Table>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Data</Th>
              <Th>Ora</Th>
              <Th>Categoria</Th>
              <Th>Sala</Th>
              <Th>Descrizione</Th>
            </Tr>
          </Thead>
          <Tbody>
            {(segnalazioniFiltrate || []).map((s) => (
              <Tr key={s.id}>
                <Td>{s.id}</Td>
                <Td>{new Date(s.data).toLocaleDateString("it-IT")}</Td>
                <Td>{s.ora}</Td>
                <Td>{s.categoria}</Td>
                <Td>{s.sala}</Td>
                <Td>{s.descrizione}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Flex>
  );
}

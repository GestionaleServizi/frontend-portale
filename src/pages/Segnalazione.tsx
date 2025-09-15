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
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react";

type Segnalazione = {
  id: number;
  data: string;
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
  const [data, setData] = useState("");
  const [ora, setOra] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const toast = useToast();

  // Carica dati
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

      const segData = await segRes.json();
      const catData = await catRes.json();

      setSegnalazioni(Array.isArray(segData) ? segData : []);
      setCategorie(Array.isArray(catData) ? catData : []);
    } catch {
      toast({ title: "Errore caricamento dati", status: "error" });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Inserisci nuova segnalazione
  const handleSubmit = async () => {
    try {
      if (!data || !ora || !categoriaId || !descrizione) {
        toast({ title: "Compila tutti i campi", status: "warning" });
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/segnalazioni`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data,
          ora,
          descrizione,
          categoria_id: categoriaId,
        }),
      });

      if (!res.ok) throw new Error("Errore inserimento segnalazione");

      toast({ title: "Segnalazione inserita", status: "success" });
      setData("");
      setOra("");
      setCategoriaId("");
      setDescrizione("");
      loadData();
    } catch {
      toast({ title: "Errore inserimento segnalazione", status: "error" });
    }
  };

  // Filtri
  const segnalazioniFiltrate = (segnalazioni || []).filter((s) => {
    const dataMatch = filtroData ? s.data.startsWith(filtroData) : true;
    const catMatch = filtroCategoria ? s.categoria === filtroCategoria : true;
    return dataMatch && catMatch;
  });

  return (
    <Flex minH="100vh" bg="gray.50" direction="column" p={8}>
      {/* Header con logo, utente e sala */}
      <VStack spacing={2} mb={6}>
        <img src="/logo.png" alt="Logo" width="120" />
        <Heading>Inserimento Segnalazioni</Heading>
        <Text>
          👤 {user?.email} | 🏢 {cliente?.nome_sala || "N/A"}
        </Text>
        <Button colorScheme="red" size="sm" onClick={logout}>
          Logout
        </Button>
      </VStack>

      {/* Form inserimento */}
      <Box bg="white" p={6} borderRadius="lg" shadow="md" mb={6}>
        <HStack spacing={4} mb={4}>
          <Input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
          <Input
            type="time"
            value={ora}
            onChange={(e) => setOra(e.target.value)}
          />
          <Select
            placeholder="Seleziona categoria"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
          >
            {(categorie || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome_categoria}
              </option>
            ))}
          </Select>
        </HStack>
        <Textarea
          placeholder="Descrizione"
          value={descrizione}
          onChange={(e) => setDescrizione(e.target.value)}
          rows={4}
        />
        <Button colorScheme="blue" mt={4} onClick={handleSubmit}>
          ➕ Inserisci Segnalazione
        </Button>
      </Box>

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

      {/* Tabella segnalazioni */}
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

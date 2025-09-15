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
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [ora, setOra] = useState(
    new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
  );
  const [categoriaId, setCategoriaId] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const toast = useToast();

  // 📌 Carica dati segnalazioni e categorie
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

  // 📌 Inserisci nuova segnalazione
  const handleSubmit = async () => {
    if (!categoriaId || !descrizione) {
      toast({ title: "Compila tutti i campi", status: "warning" });
      return;
    }

    try {
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

      if (!res.ok) throw new Error("Errore nell'inserimento");

      toast({ title: "Segnalazione inserita", status: "success" });
      setDescrizione("");
      setCategoriaId("");
      setData(new Date().toISOString().slice(0, 10));
      setOra(new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }));
      loadData();
    } catch {
      toast({ title: "Errore nell'inserimento", status: "error" });
    }
  };

  // 📌 Filtri tabella
  const segnalazioniFiltrate = (segnalazioni || []).filter((s) => {
    const dataMatch = filtroData ? s.data.startsWith(filtroData) : true;
    const catMatch = filtroCategoria ? s.categoria === filtroCategoria : true;
    return dataMatch && catMatch;
  });

  return (
    <Flex minH="100vh" bg="gray.50" direction="column" p={8}>
      {/* Header con logo, utente e sala */}
      <VStack spacing={2} mb={6}>
        <img src="/servizinet_logo.png" alt="Logo" width="120" />
        <Heading>Inserimento Segnalazione</Heading>
        <Text>
          👤 {user?.email} | 🏢 {user?.cliente?.nome_sala || "N/A"}
        </Text>
        <Button colorScheme="red" size="sm" onClick={logout}>
          Logout
        </Button>
      </VStack>

      {/* Form nuova segnalazione */}
      <Box bg="white" p={6} borderRadius="lg" shadow="md" mb={6}>
        <Heading size="md" mb={4}>
          Nuova Segnalazione
        </Heading>
        <HStack spacing={4} mb={4}>
          <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          <Input type="time" value={ora} onChange={(e) => setOra(e.target.value)} />
          <Select
            placeholder="Seleziona categoria"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
          >
            {categorie.map((c) => (
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
          mb={4}
          rows={4}
        />
        <Button colorScheme="blue" onClick={handleSubmit}>
          Inserisci Segnalazione
        </Button>
      </Box>

      {/* Filtri storico */}
      <HStack mb={4} spacing={4}>
        <Input type="date" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} />
        <Select
          placeholder="Tutte le categorie"
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
        >
          {categorie.map((c) => (
            <option key={c.id} value={c.nome_categoria}>
              {c.nome_categoria}
            </option>
          ))}
        </Select>
        <Button onClick={() => { setFiltroData(""); setFiltroCategoria(""); }}>
          Reset Filtri
        </Button>
      </HStack>

      {/* Tabella storico */}
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
            {segnalazioniFiltrate.map((s) => (
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

// src/pages/DashboardAdmin.tsx
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
  Image,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiFolder, FiBriefcase, FiLogOut, FiFileText } from "react-icons/fi";

type Segnalazione = {
  id: number;
  data: string;
  ora: string;
  descrizione: string;
  categoria?: string;
  sala?: string;
};

type Categoria = { id: number; nome_categoria: string };
type Cliente = { id: number; nome_sala: string };

export default function DashboardAdmin() {
  const { token, logout } = useAuth();
  const [segnalazioni, setSegnalazioni] = useState<Segnalazione[]>([]);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [utenti, setUtenti] = useState<any[]>([]);
  const [filtroData, setFiltroData] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const toast = useToast();
  const nav = useNavigate();

  // Carica dati
  const loadData = async () => {
    try {
      const [segRes, catRes, cliRes, uteRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/segnalazioni`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/categorie`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/clienti`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/utenti`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setSegnalazioni(await segRes.json());
      setCategorie(await catRes.json());
      setClienti(await cliRes.json());
      setUtenti(await uteRes.json());
    } catch {
      toast({ title: "Errore caricamento dati", status: "error" });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtro segnalazioni
  const segnalazioniFiltrate = segnalazioni.filter((s) => {
    const dataMatch = filtroData ? s.data.startsWith(filtroData) : true;
    const catMatch = filtroCategoria ? s.categoria === filtroCategoria : true;
    const cliMatch = filtroCliente ? s.sala === filtroCliente : true;
    return dataMatch && catMatch && cliMatch;
  });

  // KPI dinamici
  const kpiSegnalazioni = segnalazioniFiltrate.length;
  const kpiCategorie = filtroCategoria ? 1 : categorie.length;
  const kpiClienti = filtroCliente ? 1 : clienti.length;
  const kpiUtenti = utenti.length;

  return (
    <Flex minH="100vh" bg="gray.50" direction="column" p={6}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="lg">📊 Dashboard Amministratore</Heading>
        <HStack spacing={3}>
          <Button leftIcon={<FiUsers />} colorScheme="blue" onClick={() => nav("/utenti")}>
            Utenti
          </Button>
          <Button leftIcon={<FiFolder />} colorScheme="purple" onClick={() => nav("/categorie")}>
            Categorie
          </Button>
          <Button leftIcon={<FiBriefcase />} colorScheme="teal" onClick={() => nav("/clienti")}>
            Clienti
          </Button>
          <Button leftIcon={<FiFileText />} colorScheme="green">
            CSV
          </Button>
          <Button leftIcon={<FiFileText />} colorScheme="blue">
            PDF
          </Button>
          <Button leftIcon={<FiLogOut />} colorScheme="red" onClick={logout}>
            Logout
          </Button>
        </HStack>
      </Flex>

      {/* Logo al centro */}
      <Flex justify="center" mb={6}>
        <Image src="/servizinet_logo.png" alt="Logo" boxSize="180px" objectFit="contain" />
      </Flex>

      {/* KPI in card sotto al logo */}
      <HStack spacing={6} mb={6}>
        <Box flex="1" p={6} bg="white" borderRadius="lg" shadow="md" textAlign="center">
          <Text fontSize="sm" color="gray.500">📊 Segnalazioni</Text>
          <Heading size="lg">{kpiSegnalazioni}</Heading>
        </Box>
        <Box flex="1" p={6} bg="white" borderRadius="lg" shadow="md" textAlign="center">
          <Text fontSize="sm" color="gray.500">🏢 Clienti</Text>
          <Heading size="lg">{kpiClienti}</Heading>
        </Box>
        <Box flex="1" p={6} bg="white" borderRadius="lg" shadow="md" textAlign="center">
          <Text fontSize="sm" color="gray.500">🗂️ Categorie</Text>
          <Heading size="lg">{kpiCategorie}</Heading>
        </Box>
        <Box flex="1" p={6} bg="white" borderRadius="lg" shadow="md" textAlign="center">
          <Text fontSize="sm" color="gray.500">👥 Utenti</Text>
          <Heading size="lg">{kpiUtenti}</Heading>
        </Box>
      </HStack>

      {/* Filtri */}
      <HStack mb={4} spacing={4}>
        <Input type="date" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} />
        <Select placeholder="Tutte le categorie" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
          {categorie.map((c) => (
            <option key={c.id} value={c.nome_categoria}>
              {c.nome_categoria}
            </option>
          ))}
        </Select>
        <Select placeholder="Tutti i clienti" value={filtroCliente} onChange={(e) => setFiltroCliente(e.target.value)}>
          {clienti.map((c) => (
            <option key={c.id} value={c.nome_sala}>
              {c.nome_sala}
            </option>
          ))}
        </Select>
        <Button onClick={() => { setFiltroData(""); setFiltroCategoria(""); setFiltroCliente(""); }}>
          Reset Filtri
        </Button>
      </HStack>

      {/* Tabella segnalazioni */}
      <Box bg="white" p={6} borderRadius="lg" shadow="md">
        <Table>
          <Thead>
            <Tr>
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

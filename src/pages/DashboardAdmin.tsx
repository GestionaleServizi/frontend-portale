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
  VStack,
  Select,
  Input,
  useToast,
  Image,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiFolder,
  FiBriefcase,
  FiLogOut,
  FiFileText,
} from "react-icons/fi";

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
  const { token } = useAuth();
  const [segnalazioni, setSegnalazioni] = useState<Segnalazione[]>([]);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [utenti, setUtenti] = useState<any[]>([]);
  const [filtroData, setFiltroData] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const toast = useToast();
  const nav = useNavigate();

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

  const segnalazioniFiltrate = segnalazioni.filter((s) => {
    const dataMatch = filtroData ? s.data.startsWith(filtroData) : true;
    const catMatch = filtroCategoria ? s.categoria === filtroCategoria : true;
    const cliMatch = filtroCliente ? s.sala === filtroCliente : true;
    return dataMatch && catMatch && cliMatch;
  });

  return (
    <Flex minH="100vh" bg="gray.50" direction="column" p={6}>
      {/* Header */}
      <Flex justify="space-between" align="flex-start" mb={6}>
        {/* Titolo a sinistra */}
        <Heading size="lg">📊 Dashboard Amministratore</Heading>

        {/* Logo al centro */}
        <Image
          src="/servizinet_logo.png" // <-- sostituisci con il percorso corretto del tuo logo
          alt="Logo"
          boxSize="100px"
          mx="auto"
        />

        {/* Pulsanti a destra */}
        <HStack spacing={3}>
          <Button leftIcon={<FiUsers />} colorScheme="blue" onClick={() => nav("/utenti")}>
            Utenti
          </Button>
          <Button leftIcon={<FiFolder />} colorScheme="purple" onClick={() => nav("/categorie")}>
            Categorie
          </Button>
          <Button leftIcon={<FiBriefcase />} colorScheme="green" onClick={() => nav("/clienti")}>
            Clienti
          </Button>
          <Button leftIcon={<FiFileText />} colorScheme="teal">
            CSV
          </Button>
          <Button leftIcon={<FiFileText />} colorScheme="teal">
            PDF
          </Button>
          <Button leftIcon={<FiLogOut />} colorScheme="red" onClick={() => nav("/login")}>
            Logout
          </Button>
        </HStack>
      </Flex>

      {/* KPI in colonna a sinistra */}
      <Flex>
        <VStack align="stretch" spacing={4} w="200px" mr={6}>
          <Box p={4} bg="white" shadow="md" borderRadius="md">
            <Text fontSize="sm">📊 Segnalazioni</Text>
            <Heading size="lg">{segnalazioniFiltrate.length}</Heading>
          </Box>
          <Box p={4} bg="white" shadow="md" borderRadius="md">
            <Text fontSize="sm">🏢 Clienti</Text>
            <Heading size="lg">{clienti.length}</Heading>
          </Box>
          <Box p={4} bg="white" shadow="md" borderRadius="md">
            <Text fontSize="sm">🗂️ Categorie</Text>
            <Heading size="lg">{categorie.length}</Heading>
          </Box>
          <Box p={4} bg="white" shadow="md" borderRadius="md">
            <Text fontSize="sm">👥 Utenti</Text>
            <Heading size="lg">{utenti.length}</Heading>
          </Box>
        </VStack>

        {/* Tabella principale */}
        <Box flex="1" bg="white" p={6} borderRadius="lg" shadow="md">
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
              {categorie.map((c) => (
                <option key={c.id} value={c.nome_categoria}>
                  {c.nome_categoria}
                </option>
              ))}
            </Select>
            <Select
              placeholder="Tutti i clienti"
              value={filtroCliente}
              onChange={(e) => setFiltroCliente(e.target.value)}
            >
              {clienti.map((c) => (
                <option key={c.id} value={c.nome_sala}>
                  {c.nome_sala}
                </option>
              ))}
            </Select>
            <Button
              onClick={() => {
                setFiltroData("");
                setFiltroCategoria("");
                setFiltroCliente("");
              }}
            >
              Reset Filtri
            </Button>
          </HStack>

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
    </Flex>
  );
}

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
  Input,
  Select,
  useToast,
  Image,
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

  // Filtri
  const segnalazioniFiltrate = segnalazioni.filter((s) => {
    const dataMatch = filtroData ? s.data.startsWith(filtroData) : true;
    const catMatch = filtroCategoria ? s.categoria === filtroCategoria : true;
    const cliMatch = filtroCliente ? s.sala === filtroCliente : true;
    return dataMatch && catMatch && cliMatch;
  });

  // Esporta CSV
  const esportaCSV = () => {
    const header = ["ID", "Data", "Ora", "Categoria", "Sala", "Descrizione"];
    const rows = segnalazioniFiltrate.map((s) => [
      s.id,
      new Date(s.data).toLocaleDateString("it-IT"),
      s.ora,
      s.categoria || "",
      s.sala || "",
      s.descrizione || "",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(";")).join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "segnalazioni.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Flex minH="100vh" bg="gray.50" direction="column" p={6}>
      {/* Fascia superiore */}
      <Flex align="center" justify="space-between" mb={6}>
        {/* Titolo e KPI */}
        <VStack align="flex-start" spacing={4}>
          <Heading size="lg">📊 Dashboard Amministratore</Heading>
          <VStack spacing={4} align="stretch">
            <Box p={4} bg="white" borderRadius="md" shadow="sm">
              <Text fontSize="sm">📊 Segnalazioni</Text>
              <Heading size="md">{segnalazioniFiltrate.length}</Heading>
            </Box>
            <Box p={4} bg="white" borderRadius="md" shadow="sm">
              <Text fontSize="sm">🏢 Clienti</Text>
              <Heading size="md">{clienti.length}</Heading>
            </Box>
            <Box p={4} bg="white" borderRadius="md" shadow="sm">
              <Text fontSize="sm">🗂️ Categorie</Text>
              <Heading size="md">{categorie.length}</Heading>
            </Box>
            <Box p={4} bg="white" borderRadius="md" shadow="sm">
              <Text fontSize="sm">👥 Utenti</Text>
              <Heading size="md">{utenti.length}</Heading>
            </Box>
          </VStack>
        </VStack>

        {/* Logo al centro */}
        <Box>
          <Image src="/servizinet_logo.png" alt="Logo" boxSize="160px" mx="auto" />
        </Box>

        {/* Pulsanti gestione */}
        <HStack spacing={3}>
          <Button colorScheme="blue" leftIcon={<FiUsers />} onClick={() => nav("/utenti")}>
            Utenti
          </Button>
          <Button colorScheme="purple" leftIcon={<FiFolder />} onClick={() => nav("/categorie")}>
            Categorie
          </Button>
          <Button colorScheme="teal" leftIcon={<FiBriefcase />} onClick={() => nav("/clienti")}>
            Clienti
          </Button>
          <Button colorScheme="green" leftIcon={<FiFileText />} onClick={esportaCSV}>
            CSV
          </Button>
          <Button colorScheme="red" leftIcon={<FiLogOut />} onClick={logout}>
            Logout
          </Button>
        </HStack>
      </Flex>

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
        <Button onClick={() => {
          setFiltroData("");
          setFiltroCategoria("");
          setFiltroCliente("");
        }}>
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

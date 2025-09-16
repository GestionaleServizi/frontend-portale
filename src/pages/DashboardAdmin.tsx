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
  Spacer,
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

  // 📌 Carica dati
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

  // 📌 Filtra segnalazioni
  const segnalazioniFiltrate = segnalazioni.filter((s) => {
    const dataMatch = filtroData ? s.data.startsWith(filtroData) : true;
    const catMatch = filtroCategoria ? s.categoria === filtroCategoria : true;
    const cliMatch = filtroCliente ? s.sala === filtroCliente : true;
    return dataMatch && catMatch && cliMatch;
  });

  // 📌 KPI dinamici
  const kpiSegnalazioni = segnalazioniFiltrate.length;
  const kpiClienti = filtroCliente ? 1 : clienti.length;
  const kpiCategorie = filtroCategoria ? 1 : categorie.length;
  const kpiUtenti = utenti.length;

  // 📌 Esporta CSV
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

  // 📌 Esporta PDF
  const esportaPDF = () => {
    const printContent = `
      <h2>Segnalazioni</h2>
      <table border="1" cellspacing="0" cellpadding="4">
        <thead>
          <tr>
            <th>ID</th><th>Data</th><th>Ora</th>
            <th>Categoria</th><th>Sala</th><th>Descrizione</th>
          </tr>
        </thead>
        <tbody>
          ${segnalazioniFiltrate
            .map(
              (s) => `
            <tr>
              <td>${s.id}</td>
              <td>${new Date(s.data).toLocaleDateString("it-IT")}</td>
              <td>${s.ora}</td>
              <td>${s.categoria || ""}</td>
              <td>${s.sala || ""}</td>
              <td>${s.descrizione || ""}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;
    const newWin = window.open("", "_blank");
    newWin!.document.write(printContent);
    newWin!.print();
    newWin!.close();
  };

  return (
    <Flex minH="100vh" bg="gray.50" direction="column" p={8}>
      {/* Logo e titolo */}
      <Flex direction="column" align="center" mb={6}>
        <Image src="/servizinet_logo.png" alt="Logo" boxSize="80px" mb={2} />
        <Heading>📊 Dashboard Amministratore</Heading>
      </Flex>

      {/* KPI + Pulsanti */}
      <Flex align="center" mb={6}>
        <HStack spacing={6}>
          <Box p={4} bg="white" borderRadius="lg" shadow="md" textAlign="center">
            <Text fontSize="sm">📊 Segnalazioni Totali</Text>
            <Heading size="lg">{kpiSegnalazioni}</Heading>
          </Box>
          <Box p={4} bg="white" borderRadius="lg" shadow="md" textAlign="center">
            <Text fontSize="sm">🏢 Clienti</Text>
            <Heading size="lg">{kpiClienti}</Heading>
          </Box>
          <Box p={4} bg="white" borderRadius="lg" shadow="md" textAlign="center">
            <Text fontSize="sm">🗂️ Categorie</Text>
            <Heading size="lg">{kpiCategorie}</Heading>
          </Box>
          <Box p={4} bg="white" borderRadius="lg" shadow="md" textAlign="center">
            <Text fontSize="sm">👥 Utenti</Text>
            <Heading size="lg">{kpiUtenti}</Heading>
          </Box>
        </HStack>
        <Spacer />
        <HStack spacing={3}>
          <Button colorScheme="blue" leftIcon={<FiUsers />} onClick={() => nav("/utenti")}>
            Gestione Utenti
          </Button>
          <Button colorScheme="purple" leftIcon={<FiFolder />} onClick={() => nav("/categorie")}>
            Gestione Categorie
          </Button>
          <Button colorScheme="teal" leftIcon={<FiBriefcase />} onClick={() => nav("/clienti")}>
            Gestione Clienti
          </Button>
          <Button colorScheme="green" leftIcon={<FiFileText />} onClick={esportaCSV}>
            Export CSV
          </Button>
          <Button colorScheme="orange" leftIcon={<FiFileText />} onClick={esportaPDF}>
            Export PDF
          </Button>
          <Button colorScheme="red" leftIcon={<FiLogOut />} onClick={() => nav("/login")}>
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

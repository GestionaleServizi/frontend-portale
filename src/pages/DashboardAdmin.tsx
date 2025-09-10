import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Input,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

// Helper per data in formato italiano
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

type Segnalazione = {
  id: number;
  data: string;
  ora: string;
  descrizione: string;
  nome_categoria?: string;
  nome_sala?: string;
};

export default function DashboardAdmin() {
  const [segnalazioni, setSegnalazioni] = useState<Segnalazione[]>([]);
  const [categorie, setCategorie] = useState<any[]>([]);
  const [clienti, setClienti] = useState<any[]>([]);
  const [utenti, setUtenti] = useState<any[]>([]);
  const [filtroData, setFiltroData] = useState<string>("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("");
  const [filtroCliente, setFiltroCliente] = useState<string>("");

  const nav = useNavigate();
  const toast = useToast();
  const token = localStorage.getItem("token");
  const userEmail = "admin@tuazienda.it"; // TODO: ricavare da localStorage

  // Carica dati dal backend
  useEffect(() => {
    // Segnalazioni
    fetch(`${import.meta.env.VITE_API_BASE_URL}/segnalazioni`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setSegnalazioni)
      .catch(() =>
        toast({
          title: "Errore caricamento segnalazioni",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      );

    // Categorie
    fetch(`${import.meta.env.VITE_API_BASE_URL}/categorie`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setCategorie)
      .catch(() =>
        toast({
          title: "Errore caricamento categorie",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      );

    // Clienti
    fetch(`${import.meta.env.VITE_API_BASE_URL}/clienti`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setClienti)
      .catch(() =>
        toast({
          title: "Errore caricamento clienti",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      );

    // Utenti
    fetch(`${import.meta.env.VITE_API_BASE_URL}/utenti`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setUtenti)
      .catch(() =>
        toast({
          title: "Errore caricamento utenti",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      );
  }, [toast, token]);

  const handleLogout = () => {
    localStorage.clear();
    nav("/login");
  };

  const resetFiltri = () => {
    setFiltroData("");
    setFiltroCategoria("");
    setFiltroCliente("");
  };

  // Applica filtri
  const segnalazioniFiltrate = segnalazioni.filter((s) => {
    const matchData = filtroData ? s.data.startsWith(filtroData) : true;
    const matchCategoria = filtroCategoria
      ? s.nome_categoria === filtroCategoria
      : true;
    const matchCliente = filtroCliente ? s.nome_sala === filtroCliente : true;
    return matchData && matchCategoria && matchCliente;
  });

  // Esporta CSV
  const esportaCSV = () => {
    const header = ["ID", "Data", "Ora", "Categoria", "Sala", "Descrizione"];
    const rows = segnalazioniFiltrate.map((s) => [
      s.id,
      formatDate(s.data),
      s.ora,
      s.nome_categoria || "",
      s.nome_sala || "",
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

  // Esporta PDF
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
              <td>${formatDate(s.data)}</td>
              <td>${s.ora}</td>
              <td>${s.nome_categoria || ""}</td>
              <td>${s.nome_sala || ""}</td>
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
    <Flex minH="100vh" bg="gray.50" direction="column">
      {/* Header */}
      <Flex
        as="header"
        bg="brand.500"
        color="white"
        px={6}
        py={4}
        justify="space-between"
        align="center"
        shadow="sm"
      >
        <Heading size="md">Dashboard Amministratore</Heading>
        <HStack spacing={4}>
          <Text>{userEmail}</Text>
          <Button colorScheme="red" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </HStack>
      </Flex>

      <Flex flex="1" p={8} direction="column" gap={8}>
        {/* KPI */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          <Box p={6} bg="white" borderRadius="lg" shadow="md" textAlign="center">
            <Text fontSize="sm">📊 Segnalazioni Totali</Text>
            <Heading size="lg">{segnalazioni.length}</Heading>
          </Box>
          <Box p={6} bg="white" borderRadius="lg" shadow="md" textAlign="center">
            <Text fontSize="sm">🏢 Clienti</Text>
            <Heading size="lg">{clienti.length}</Heading>
          </Box>
          <Box p={6} bg="white" borderRadius="lg" shadow="md" textAlign="center">
            <Text fontSize="sm">🗂️ Categorie</Text>
            <Heading size="lg">{categorie.length}</Heading>
          </Box>
          <Box p={6} bg="white" borderRadius="lg" shadow="md" textAlign="center">
            <Text fontSize="sm">👥 Utenti</Text>
            <Heading size="lg">{utenti.length}</Heading>
          </Box>
        </SimpleGrid>

        {/* Filtri */}
        <HStack spacing={4} align="flex-end">
          <Input
            type="date"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
          />
          <Select
            placeholder="Filtra per categoria"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            {categorie.map((cat) => (
              <option key={cat.id} value={cat.nome_categoria}>
                {cat.nome_categoria}
              </option>
            ))}
          </Select>
          <Select
            placeholder="Filtra per cliente"
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
          >
            {clienti.map((cl) => (
              <option key={cl.id} value={cl.nome_sala}>
                {cl.nome_sala}
              </option>
            ))}
          </Select>
          <Button colorScheme="gray" onClick={resetFiltri}>
            🔄 Reset Filtri
          </Button>
        </HStack>

        {/* Tabella segnalazioni */}
        <Box bg="white" p={6} borderRadius="lg" shadow="md">
          <Table variant="simple">
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
                  <Td>{formatDate(s.data)}</Td>
                  <Td>{s.ora}</Td>
                  <Td>{s.nome_categoria || "-"}</Td>
                  <Td>{s.nome_sala || "-"}</Td>
                  <Td>{s.descrizione}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Bottoni esportazione */}
        <HStack spacing={6} justify="center" mt={4}>
          <Button colorScheme="green" onClick={esportaCSV}>
            ⬇️ Esporta CSV
          </Button>
          <Button colorScheme="blue" onClick={esportaPDF}>
            ⬇️ Esporta PDF
          </Button>
        </HStack>
      </Flex>
    </Flex>
  );
}

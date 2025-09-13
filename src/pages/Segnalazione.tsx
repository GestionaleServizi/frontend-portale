import React, { useEffect, useState } from "react";
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
} from "@chakra-ui/react";
import { useAuth } from "../hooks/useAuth";

type Segnalazione = {
  id: number;
  data: string;
  ora: string;
  descrizione: string;
  categoria: string;
  sala: string;
};

type Categoria = { id: number; nome_categoria: string };

export default function Segnalazione() {
  const { token, user, logout } = useAuth();
  const [segnalazioni, setSegnalazioni] = useState<Segnalazione[]>([]);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [descrizione, setDescrizione] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const toast = useToast();

  // 📌 Carica segnalazioni e categorie
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

      setSegnalazioni(await segRes.json());
      setCategorie(await catRes.json());
    } catch {
      toast({ title: "Errore caricamento dati", status: "error" });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 📌 Inserisci nuova segnalazione
  const handleSubmit = async () => {
    if (!descrizione || !categoriaId) {
      toast({ title: "Compila tutti i campi", status: "warning" });
      return;
    }

    const oggi = new Date();
    const data = oggi.toISOString().split("T")[0];
    const ora = oggi.toTimeString().slice(0, 5);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/segnalazioni`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data, ora, descrizione, categoria_id: categoriaId }),
      });

      if (!res.ok) throw new Error("Errore inserimento");
      setDescrizione("");
      setCategoriaId("");
      toast({ title: "Segnalazione inserita", status: "success" });
      loadData();
    } catch {
      toast({ title: "Errore nell'inserimento", status: "error" });
    }
  };

  // 📌 Esporta CSV
  const esportaCSV = () => {
    const header = ["ID", "Data", "Ora", "Categoria", "Sala", "Descrizione"];
    const rows = segnalazioni.map((s) => [
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

  // 📌 Esporta PDF (stampa browser)
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
          ${segnalazioni
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
    <Flex minH="100vh" bg="gray.50" direction="column" align="center" p={8}>
      {/* Header con logo + info utente */}
      <Flex w="100%" justify="space-between" align="center" mb={6}>
        <Image src="/logo.png" alt="Logo" boxSize="60px" mx="auto" />
        <Box textAlign="right">
          <Text fontSize="sm">👤 {user?.email}</Text>
          <Text fontSize="sm">🏢 {user?.sala}</Text>
        </Box>
        <Button colorScheme="red" size="sm" onClick={logout}>
          Logout
        </Button>
      </Flex>

      {/* Form al centro */}
      <Box
        bg="white"
        p={6}
        borderRadius="lg"
        shadow="md"
        w="100%"
        maxW="600px"
        textAlign="center"
        mb={8}
      >
        <Heading size="md" mb={4}>
          ➕ Nuova Segnalazione
        </Heading>
        <HStack spacing={4} mb={4}>
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
          <Input
            placeholder="Descrizione"
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
          />
        </HStack>
        <Button colorScheme="blue" onClick={handleSubmit}>
          Invia
        </Button>
      </Box>

      {/* Storico segnalazioni */}
      <Box bg="white" p={6} borderRadius="lg" shadow="md" w="100%" maxW="900px">
        <Heading size="md" mb={4}>
          📋 Storico Segnalazioni
        </Heading>
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
            {segnalazioni.map((s) => (
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

        {/* Export buttons */}
        <HStack spacing={6} justify="center" mt={4}>
          <Button colorScheme="green" onClick={esportaCSV}>
            ⬇️ Esporta CSV
          </Button>
          <Button colorScheme="blue" onClick={esportaPDF}>
            ⬇️ Esporta PDF
          </Button>
        </HStack>
      </Box>
    </Flex>
  );
}

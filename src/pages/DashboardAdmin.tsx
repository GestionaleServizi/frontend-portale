import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Flex,
} from "@chakra-ui/react";
import axios from "axios";
import { jsPDF } from "jspdf";
import Papa from "papaparse";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

interface Segnalazione {
  id: number;
  data: string;
  ora: string;
  categoria: string;
  sala: string;
  descrizione: string;
}

export default function DashboardAdmin() {
  const [categorie, setCategorie] = useState<number>(0);
  const [utenti, setUtenti] = useState<number>(0);
  const [segnalazioni, setSegnalazioni] = useState<Segnalazione[]>([]);
  const [clienti, setClienti] = useState<number>(0);

  // 📌 Funzione per esportare CSV
  const exportToCSV = () => {
    const csv = Papa.unparse(segnalazioni);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "segnalazioni.csv";
    a.click();
  };

  // 📌 Funzione per esportare PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Segnalazioni", 20, 10);
    segnalazioni.forEach((s, i) => {
      doc.text(
        `${s.data} ${s.ora} | ${s.categoria} | ${s.sala} | ${s.descrizione}`,
        20,
        20 + i * 10
      );
    });
    doc.save("segnalazioni.pdf");
  };

  // 📌 Caricamento dati dal backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, utRes, segRes, clRes] = await Promise.all([
          axios.get("/api/categorie"),
          axios.get("/api/utenti"),
          axios.get("/api/segnalazioni"),
          axios.get("/api/clienti"),
        ]);

        setCategorie(catRes.data.length);
        setUtenti(utRes.data.length);
        setSegnalazioni(segRes.data);
        setClienti(clRes.data.length);
      } catch (err) {
        console.error("Errore caricamento dati dashboard:", err);
      }
    };

    fetchData();
  }, []);

  // 📌 Logout finto (placeholder)
  const handleLogout = () => {
    console.log("Logout non ancora implementato 🚪");
    // qui poi metteremo logica: rimozione token, redirect a login, ecc.
  };

  return (
    <Box p={6}>
      {/* 🔹 Header con Logout */}
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="2xl" fontWeight="bold">
          Dashboard Admin
        </Text>
        <Button colorScheme="red" onClick={handleLogout}>
          Logout
        </Button>
      </Flex>

      {/* 🔹 Box KPI */}
      <SimpleGrid columns={[1, 2, 4]} spacing={6} mb={6}>
        <MotionBox
          p={6}
          bg="blue.500"
          color="white"
          rounded="xl"
          shadow="md"
          whileHover={{ scale: 1.05 }}
        >
          <Text fontSize="lg">Categorie</Text>
          <Text fontSize="3xl" fontWeight="bold">
            {categorie}
          </Text>
        </MotionBox>

        <MotionBox
          p={6}
          bg="green.500"
          color="white"
          rounded="xl"
          shadow="md"
          whileHover={{ scale: 1.05 }}
        >
          <Text fontSize="lg">Utenti</Text>
          <Text fontSize="3xl" fontWeight="bold">
            {utenti}
          </Text>
        </MotionBox>

        <MotionBox
          p={6}
          bg="purple.500"
          color="white"
          rounded="xl"
          shadow="md"
          whileHover={{ scale: 1.05 }}
        >
          <Text fontSize="lg">Segnalazioni Totali</Text>
          <Text fontSize="3xl" fontWeight="bold">
            {segnalazioni.length}
          </Text>
        </MotionBox>

        <MotionBox
          p={6}
          bg="orange.500"
          color="white"
          rounded="xl"
          shadow="md"
          whileHover={{ scale: 1.05 }}
        >
          <Text fontSize="lg">Clienti</Text>
          <Text fontSize="3xl" fontWeight="bold">
            {clienti}
          </Text>
        </MotionBox>
      </SimpleGrid>

      {/* 🔹 Tabella segnalazioni */}
      <Box overflowX="auto" bg="white" p={6} rounded="xl" shadow="md">
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontSize="xl" fontWeight="bold">
            Segnalazioni
          </Text>
          <Flex gap={2}>
            <Button colorScheme="blue" onClick={exportToCSV}>
              Esporta CSV
            </Button>
            <Button colorScheme="green" onClick={exportToPDF}>
              Esporta PDF
            </Button>
          </Flex>
        </Flex>

        <Table variant="simple">
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
            {segnalazioni.map((s) => (
              <Tr key={s.id}>
                <Td>{s.data}</Td>
                <Td>{s.ora}</Td>
                <Td>{s.categoria}</Td>
                <Td>{s.sala}</Td>
                <Td>{s.descrizione}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}

import React, { useEffect, useState } from "react";
import {
  Box, Flex, Heading, Button, VStack, HStack, Text,
  SimpleGrid, Table, Thead, Tbody, Tr, Th, Td,
  Select, Input, useToast
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

// Funzione helper per formattare la data in italiano
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("it-IT", {
    day: "2-digit", month: "2-digit", year: "numeric"
  });
};

export default function DashboardAdmin() {
  const [segnalazioni, setSegnalazioni] = useState<any[]>([]);
  const nav = useNavigate();
  const toast = useToast();
  const userEmail = "admin@tuazienda.it";

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/segnalazioni`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => setSegnalazioni(data))
      .catch(() => toast({
        title: "Errore caricamento dati",
        status: "error",
        duration: 3000,
        isClosable: true,
      }));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    nav("/login");
  };

  return (
    <Flex minH="100vh" bg="gray.50" direction="column">
      {/* Header */}
      <Flex as="header" bg="brand.500" color="white" px={6} py={4}
        justify="space-between" align="center" shadow="sm">
        <Heading size="md">Dashboard Amministratore</Heading>
        <HStack spacing={4}>
          <Text>{userEmail}</Text>
          <Button colorScheme="red" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </HStack>
      </Flex>

      <Flex flex="1" p={8} direction="column" gap={8}>
        {/* KPI placeholder */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          <Box p={6} bg="white" borderRadius="lg" shadow="md" textAlign="center">
            <Text fontSize="sm">📊 Segnalazioni Totali</Text>
            <Heading size="lg">{segnalazioni.length}</Heading>
          </Box>
          <Box p={6} bg="white" borderRadius="lg" shadow="md" textAlign="center">
            <Text fontSize="sm">🏢 Clienti</Text>
            <Heading size="lg">--</Heading>
          </Box>
          <Box p={6} bg="white" borderRadius="lg" shadow="md" textAlign="center">
            <Text fontSize="sm">🗂️ Categorie</Text>
            <Heading size="lg">--</Heading>
          </Box>
          <Box p={6} bg="white" borderRadius="lg" shadow="md" textAlign="center">
            <Text fontSize="sm">👥 Utenti</Text>
            <Heading size="lg">--</Heading>
          </Box>
        </SimpleGrid>

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
              {segnalazioni.map((s) => (
                <Tr key={s.id}>
                  <Td>{s.id}</Td>
                  <Td>{formatDate(s.data)}</Td>
                  <Td>{s.ora}</Td>
                  <Td>{s.categoria_nome || "-"}</Td>
                  <Td>{s.cliente_nome || "-"}</Td>
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

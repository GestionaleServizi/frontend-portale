// src/pages/ClientiPage.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Box,
  Flex,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  HStack,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  Image,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

type Cliente = {
  id: number;
  nome_sala: string;
  email: string;
  referente: string;
  telefono: string;
  indirizzo: string;
  orari_apertura: string;
};

export default function ClientiPage() {
  const { token, logout } = useAuth();
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();

  const loadClienti = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/clienti`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClienti(await res.json());
    } catch {
      toast({ title: "Errore caricamento clienti", status: "error" });
    }
  };

  useEffect(() => {
    loadClienti();
  }, []);

  const handleSave = async () => {
    if (!selectedCliente) return;
    try {
      const method = selectedCliente.id ? "PUT" : "POST";
      const url = selectedCliente.id
        ? `${import.meta.env.VITE_API_BASE_URL}/clienti/${selectedCliente.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/clienti`;

      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(selectedCliente),
      });

      toast({ title: "Cliente salvato", status: "success" });
      onClose();
      loadClienti();
    } catch {
      toast({ title: "Errore salvataggio cliente", status: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Sei sicuro di voler eliminare questo cliente?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/clienti/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "Cliente eliminato", status: "info" });
      loadClienti();
    } catch {
      toast({ title: "Errore eliminazione cliente", status: "error" });
    }
  };

  return (
    <Flex minH="100vh" direction="column" bg="gray.50" p={8}>
      {/* Header con titolo, logo e pulsanti */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">🏢 Gestione Clienti</Heading>
        <Image src="/servizinet_logo.png" alt="Logo" boxSize="160px" objectFit="contain" />
        <HStack spacing={4}>
          <Button colorScheme="blue" onClick={() => navigate("/dashboard")}>
            📊 Dashboard
          </Button>
          <Button colorScheme="red" onClick={logout}>
            🚪 Logout
          </Button>
        </HStack>
      </Flex>

      {/* Tabella clienti */}
      <Box bg="white" p={6} borderRadius="lg" shadow="md">
        <Flex justify="space-between" mb={4}>
          <Heading size="md">Lista Clienti</Heading>
          <Button
            colorScheme="green"
            leftIcon={<AddIcon />}
            onClick={() => {
              setSelectedCliente({
                id: 0,
                nome_sala: "",
                email: "",
                referente: "",
                telefono: "",
                indirizzo: "",
                orari_apertura: "",
              });
              onOpen();
            }}
          >
            Aggiungi Cliente
          </Button>
        </Flex>

        <Table>
          <Thead>
            <Tr>
              <Th>Nome Sala</Th>
              <Th>Email</Th>
              <Th>Referente</Th>
              <Th>Telefono</Th>
              <Th>Indirizzo</Th>
              <Th>Orari Apertura</Th>
              <Th>Azioni</Th>
            </Tr>
          </Thead>
          <Tbody>
            {clienti.map((c) => (
              <Tr key={c.id}>
                <Td>{c.nome_sala}</Td>
                <Td>{c.email}</Td>
                <Td>{c.referente}</Td>
                <Td>{c.telefono}</Td>
                <Td>{c.indirizzo}</Td>
                <Td>{c.orari_apertura}</Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="Modifica"
                      icon={<EditIcon />}
                      onClick={() => {
                        setSelectedCliente(c);
                        onOpen();
                      }}
                    />
                    <IconButton
                      aria-label="Elimina"
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      onClick={() => handleDelete(c.id)}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Modal per inserimento/modifica */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedCliente?.id ? "Modifica Cliente" : "Nuovo Cliente"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Nome Sala</FormLabel>
              <Input
                value={selectedCliente?.nome_sala || ""}
                onChange={(e) =>
                  setSelectedCliente({
                    ...selectedCliente!,
                    nome_sala: e.target.value,
                  })
                }
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Email</FormLabel>
              <Input
                value={selectedCliente?.email || ""}
                onChange={(e) =>
                  setSelectedCliente({
                    ...selectedCliente!,
                    email: e.target.value,
                  })
                }
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Referente</FormLabel>
              <Input
                value={selectedCliente?.referente || ""}
                onChange={(e) =>
                  setSelectedCliente({
                    ...selectedCliente!,
                    referente: e.target.value,
                  })
                }
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Telefono</FormLabel>
              <Input
                value={selectedCliente?.telefono || ""}
                onChange={(e) =>
                  setSelectedCliente({
                    ...selectedCliente!,
                    telefono: e.target.value,
                  })
                }
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Indirizzo</FormLabel>
              <Input
                value={selectedCliente?.indirizzo || ""}
                onChange={(e) =>
                  setSelectedCliente({
                    ...selectedCliente!,
                    indirizzo: e.target.value,
                  })
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Orari Apertura</FormLabel>
              <Input
                value={selectedCliente?.orari_apertura || ""}
                onChange={(e) =>
                  setSelectedCliente({
                    ...selectedCliente!,
                    orari_apertura: e.target.value,
                  })
                }
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSave}>
              Salva
            </Button>
            <Button onClick={onClose}>Annulla</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

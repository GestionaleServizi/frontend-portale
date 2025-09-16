// src/pages/ClientiPage.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  HStack,
  IconButton,
  useToast,
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
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiHome } from "react-icons/fi";

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
  const [clienteSelezionato, setClienteSelezionato] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState<Partial<Cliente>>({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const nav = useNavigate();

  // Carica clienti
  const loadClienti = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/clienti`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Errore caricamento clienti");
      setClienti(await res.json());
    } catch {
      toast({ title: "Errore caricamento clienti", status: "error" });
    }
  };

  useEffect(() => {
    loadClienti();
  }, []);

  // Salva nuovo/modificato
  const salvaCliente = async () => {
    try {
      const metodo = clienteSelezionato ? "PUT" : "POST";
      const url = clienteSelezionato
        ? `${import.meta.env.VITE_API_BASE_URL}/clienti/${clienteSelezionato.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/clienti`;

      const res = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Errore salvataggio cliente");

      toast({ title: "Cliente salvato", status: "success" });
      onClose();
      setFormData({});
      setClienteSelezionato(null);
      loadClienti();
    } catch {
      toast({ title: "Impossibile salvare il cliente", status: "error" });
    }
  };

  // Elimina
  const eliminaCliente = async (id: number) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/clienti/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Errore eliminazione");
      toast({ title: "Cliente eliminato", status: "info" });
      loadClienti();
    } catch {
      toast({ title: "Impossibile eliminare il cliente", status: "error" });
    }
  };

  return (
    <Flex minH="100vh" bg="gray.50" direction="column" p={6}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="lg">🏢 Gestione Clienti</Heading>
        <HStack spacing={3}>
          <Button leftIcon={<FiHome />} colorScheme="blue" onClick={() => nav("/dashboard")}>
            Dashboard
          </Button>
          <Button leftIcon={<FiLogOut />} colorScheme="red" onClick={logout}>
            Logout
          </Button>
        </HStack>
      </Flex>

      {/* Logo al centro */}
      <Flex justify="center" mb={6}>
        <Image src="/servizinet_logo.png" alt="Logo" boxSize="240px" objectFit="contain" />
      </Flex>

      {/* Tabella */}
      <Box bg="white" p={6} borderRadius="lg" shadow="md">
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">Elenco Clienti</Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="green"
            onClick={() => {
              setClienteSelezionato(null);
              setFormData({});
              onOpen();
            }}
          >
            Nuovo Cliente
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
                      size="sm"
                      onClick={() => {
                        setClienteSelezionato(c);
                        setFormData(c);
                        onOpen();
                      }}
                    />
                    <IconButton
                      aria-label="Elimina"
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      onClick={() => eliminaCliente(c.id)}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{clienteSelezionato ? "Modifica Cliente" : "Nuovo Cliente"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Nome Sala</FormLabel>
              <Input value={formData.nome_sala || ""} onChange={(e) => setFormData({ ...formData, nome_sala: e.target.value })} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Email</FormLabel>
              <Input value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Referente</FormLabel>
              <Input value={formData.referente || ""} onChange={(e) => setFormData({ ...formData, referente: e.target.value })} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Telefono</FormLabel>
              <Input value={formData.telefono || ""} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Indirizzo</FormLabel>
              <Input value={formData.indirizzo || ""} onChange={(e) => setFormData({ ...formData, indirizzo: e.target.value })} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Orari Apertura</FormLabel>
              <Input value={formData.orari_apertura || ""} onChange={(e) => setFormData({ ...formData, orari_apertura: e.target.value })} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={salvaCliente}>
              Salva
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Annulla
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

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
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";

type Cliente = {
  id: number;
  nome_sala: string;
  email?: string;
  referente?: string;
  telefono?: string;
  indirizzo?: string;
  orari_apertura?: string;
};

export default function ClientiPage() {
  const { token, user } = useAuth();
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState<Partial<Cliente>>({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // 📌 Recupera lista clienti
  const fetchClienti = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/clienti`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Errore caricamento clienti");
      const data = await res.json();
      setClienti(data);
    } catch (err) {
      console.error("Errore fetch clienti:", err);
      toast({
        title: "Errore",
        description: "Impossibile caricare i clienti",
        status: "error",
      });
    }
  };

  useEffect(() => {
    if (token) fetchClienti();
  }, [token]);

  // 📌 Gestione apertura form nuovo cliente
  const handleAdd = () => {
    setEditingCliente(null);
    setFormData({});
    onOpen();
  };

  // 📌 Gestione apertura form modifica cliente
  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData(cliente);
    onOpen();
  };

  // 📌 Salvataggio cliente
  const handleSave = async () => {
    try {
      const method = editingCliente ? "PUT" : "POST";
      const url = editingCliente
        ? `${import.meta.env.VITE_API_BASE_URL}/clienti/${editingCliente.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/clienti`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Errore salvataggio cliente");

      toast({
        title: "Successo",
        description: `Cliente ${editingCliente ? "aggiornato" : "creato"} correttamente`,
        status: "success",
      });

      onClose();
      fetchClienti();
    } catch (err) {
      console.error("Errore salvataggio:", err);
      toast({
        title: "Errore",
        description: "Impossibile salvare il cliente",
        status: "error",
      });
    }
  };

  // 📌 Eliminazione cliente
  const handleDelete = async (id: number) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo cliente?")) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/clienti/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Errore eliminazione cliente");

      toast({
        title: "Cliente eliminato",
        status: "info",
      });

      fetchClienti();
    } catch (err) {
      console.error("Errore eliminazione:", err);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il cliente",
        status: "error",
      });
    }
  };

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Gestione Clienti</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={handleAdd}>
          Aggiungi Cliente
        </Button>
      </Flex>

      <Table variant="striped" colorScheme="gray">
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
              <Td>{c.email || "-"}</Td>
              <Td>{c.referente || "-"}</Td>
              <Td>{c.telefono || "-"}</Td>
              <Td>{c.indirizzo || "-"}</Td>
              <Td>{c.orari_apertura || "-"}</Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton
                    aria-label="Modifica"
                    icon={<EditIcon />}
                    size="sm"
                    onClick={() => handleEdit(c)}
                  />
                  <IconButton
                    aria-label="Elimina"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDelete(c.id)}
                  />
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* 📌 Modal per creazione/modifica cliente */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingCliente ? "Modifica Cliente" : "Nuovo Cliente"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Nome Sala</FormLabel>
              <Input
                value={formData.nome_sala || ""}
                onChange={(e) => setFormData({ ...formData, nome_sala: e.target.value })}
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Email</FormLabel>
              <Input
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Referente</FormLabel>
              <Input
                value={formData.referente || ""}
                onChange={(e) => setFormData({ ...formData, referente: e.target.value })}
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Telefono</FormLabel>
              <Input
                value={formData.telefono || ""}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Indirizzo</FormLabel>
              <Input
                value={formData.indirizzo || ""}
                onChange={(e) => setFormData({ ...formData, indirizzo: e.target.value })}
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Orari Apertura</FormLabel>
              <Input
                value={formData.orari_apertura || ""}
                onChange={(e) => setFormData({ ...formData, orari_apertura: e.target.value })}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={handleSave}>
              Salva
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

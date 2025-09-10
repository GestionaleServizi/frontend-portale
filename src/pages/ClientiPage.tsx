import React, { useEffect, useState } from "react";
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
import { useAuth } from "../hooks/useAuth";

type Cliente = {
  id: number;
  nome_sala: string;
  codice_sala: string;
  email?: string;
  referente?: string;
  telefono?: string;
  created_at?: string;
};

export default function ClientiPage() {
  const { token } = useAuth();
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [selected, setSelected] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState<Partial<Cliente>>({});
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const loadClienti = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/clienti`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setClienti(data);
    } catch {
      toast({ title: "Errore caricamento clienti", status: "error" });
    }
  };

  useEffect(() => {
    loadClienti();
  }, []);

  const handleSave = async () => {
    try {
      const method = selected ? "PUT" : "POST";
      const url = selected
        ? `${import.meta.env.VITE_API_BASE_URL}/clienti/${selected.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/clienti`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Errore salvataggio");

      toast({
        title: selected ? "Cliente aggiornato" : "Cliente creato",
        status: "success",
      });
      onClose();
      setSelected(null);
      setFormData({});
      loadClienti();
    } catch {
      toast({ title: "Errore salvataggio", status: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Vuoi davvero eliminare questo cliente?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/clienti/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "Cliente eliminato", status: "info" });
      loadClienti();
    } catch {
      toast({ title: "Errore eliminazione", status: "error" });
    }
  };

  const openModal = (cliente?: Cliente) => {
    if (cliente) {
      setSelected(cliente);
      setFormData(cliente);
    } else {
      setSelected(null);
      setFormData({});
    }
    onOpen();
  };

  return (
    <Flex minH="100vh" bg="gray.50" direction="column" p={8}>
      <Heading mb={6}>🏢 Gestione Clienti</Heading>

      <Box bg="white" p={6} borderRadius="lg" shadow="md">
        <HStack justify="flex-end" mb={4}>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="teal"
            onClick={() => openModal()}
          >
            Aggiungi Cliente
          </Button>
        </HStack>

        <Table>
          <Thead>
            <Tr>
              <Th>Nome Sala</Th>
              <Th>Codice Sala</Th>
              <Th>Email</Th>
              <Th>Referente</Th>
              <Th>Telefono</Th>
              <Th>Creato il</Th>
              <Th>Azioni</Th>
            </Tr>
          </Thead>
          <Tbody>
            {clienti.map((c) => (
              <Tr key={c.id}>
                <Td>{c.nome_sala}</Td>
                <Td>{c.codice_sala}</Td>
                <Td>{c.email || "-"}</Td>
                <Td>{c.referente || "-"}</Td>
                <Td>{c.telefono || "-"}</Td>
                <Td>
                  {c.created_at
                    ? new Date(c.created_at).toLocaleDateString("it-IT")
                    : "-"}
                </Td>
                <Td>
                  <HStack>
                    <IconButton
                      aria-label="Modifica"
                      icon={<EditIcon />}
                      size="sm"
                      onClick={() => openModal(c)}
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
      </Box>

      {/* Modale Aggiungi/Modifica Cliente */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selected ? "Modifica Cliente" : "Nuovo Cliente"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Nome Sala</FormLabel>
              <Input
                value={formData.nome_sala || ""}
                onChange={(e) =>
                  setFormData({ ...formData, nome_sala: e.target.value })
                }
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Codice Sala</FormLabel>
              <Input
                value={formData.codice_sala || ""}
                onChange={(e) =>
                  setFormData({ ...formData, codice_sala: e.target.value })
                }
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Referente</FormLabel>
              <Input
                value={formData.referente || ""}
                onChange={(e) =>
                  setFormData({ ...formData, referente: e.target.value })
                }
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Telefono</FormLabel>
              <Input
                value={formData.telefono || ""}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSave}>
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

/**
 * Service pour la gestion des documents
 */

import type { PaginatedResponse, PaginationParams } from './api'
import type { Document, DocumentFormData } from '~/types/autres-modules'

const BASE_PATH = '/api/v1/admin/documents'
const UPLOAD_PATH = '/api/v1/admin/upload'

export interface UploadResponse {
  id: string
  url: string
  filename: string
  size: number
  mime_type: string
}

export const useDocumentsService = () => {
  const api = useApi()

  // ============================================================================
  // DOCUMENTS
  // ============================================================================

  const getDocuments = async (
    params?: PaginationParams & {
      compte_administratif_id?: string
      type_fichier?: 'excel' | 'word' | 'pdf' | 'autre'
      est_public?: boolean
      search?: string
      tags?: string[]
    }
  ): Promise<PaginatedResponse<Document>> => {
    return api.get<PaginatedResponse<Document>>(BASE_PATH, params)
  }

  const getDocument = async (id: string): Promise<Document> => {
    return api.get<Document>(`${BASE_PATH}/${id}`)
  }

  const createDocument = async (data: DocumentFormData): Promise<Document> => {
    return api.post<Document>(BASE_PATH, data)
  }

  const updateDocument = async (id: string, data: Partial<DocumentFormData>): Promise<Document> => {
    return api.put<Document>(`${BASE_PATH}/${id}`, data)
  }

  const deleteDocument = async (id: string): Promise<void> => {
    return api.delete<void>(`${BASE_PATH}/${id}`)
  }

  const getDocumentsByCompte = async (compteId: string): Promise<Document[]> => {
    return api.get<Document[]>(`${BASE_PATH}/compte/${compteId}`)
  }

  // ============================================================================
  // UPLOAD
  // ============================================================================

  const uploadFile = async (
    file: File,
    metadata?: {
      titre?: string
      description?: string
      compte_administratif_id?: string
      est_public?: boolean
      tags?: string[]
    }
  ): Promise<UploadResponse> => {
    return api.upload<UploadResponse>(`${UPLOAD_PATH}/documents`, file, metadata)
  }

  const uploadImage = async (file: File): Promise<UploadResponse> => {
    return api.upload<UploadResponse>(`${UPLOAD_PATH}/images`, file)
  }

  const deleteFile = async (fileUrl: string): Promise<void> => {
    return api.delete<void>(`${UPLOAD_PATH}/delete`, { params: { url: fileUrl } })
  }

  // ============================================================================
  // TÉLÉCHARGEMENT
  // ============================================================================

  const downloadDocument = async (id: string): Promise<Blob> => {
    return api.download(`${BASE_PATH}/${id}/download`)
  }

  const incrementDownloadCount = async (id: string): Promise<void> => {
    return api.post<void>(`${BASE_PATH}/${id}/download-count`)
  }

  return {
    // Documents
    getDocuments,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    getDocumentsByCompte,

    // Upload
    uploadFile,
    uploadImage,
    deleteFile,

    // Téléchargement
    downloadDocument,
    incrementDownloadCount,
  }
}

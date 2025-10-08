// Helpers client-only para consumir la API con fetch relativo

export async function fetchExpedientesClient() {
  const res = await fetch('/api/expedientes');
  if (!res.ok) throw new Error('failed_fetch');
  return res.json();
}

export async function createExpedienteClient(data: { number: string; state: string; responsibleUserId: number; areaId: number }) {
  const res = await fetch('/api/expedientes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('create_failed');
  return res.json();
}

export async function updateExpedienteClient(id: number, data: { number: string; state: string; responsibleUserId: number; areaId: number }) {
  const res = await fetch('/api/expedientes', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...data }),
  });
  if (!res.ok) throw new Error('update_failed');
  return res.json();
}

export async function deleteExpedienteClient(id: number) {
  const res = await fetch(`/api/expedientes?id=${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'delete_failed');
  }
  return res.json();
}

export async function fetchExpedientesWithDocumentsClient() {
  const res = await fetch('/api/expedientes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getExpedientesWithDocuments' }),
  });
  if (!res.ok) throw new Error('expedientes_with_documents_failed');
  return res.json();
}

export async function fetchAreasClient() {
  const res = await fetch('/api/areas');
  if (!res.ok) throw new Error('areas_failed');
  return res.json();
}

export async function createAreaClient(name: string) {
  const res = await fetch('/api/areas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('create_area_failed');
  return res.json();
}

export async function deleteAreaClient(id: number) {
  const res = await fetch(`/api/areas?id=${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'delete_area_failed');
  }
  return res.json();
}

export async function fetchAreasWithExpedientesClient() {
  const res = await fetch('/api/areas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getAreasWithExpedientes' }),
  });
  if (!res.ok) throw new Error('areas_with_expedientes_failed');
  return res.json();
}

// ----- Documentos -----
export async function fetchDocumentsClient() {
  const res = await fetch('/api/documentos');
  if (!res.ok) throw new Error('documents_failed');
  return res.json();
}

export async function createDocumentClient(data: { expedienteId: number; name: string; date: string; filePath: string }) {
  const res = await fetch('/api/documentos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('create_document_failed');
  return res.json();
}

export async function updateDocumentClient(id: number, data: { expedienteId: number; name: string; date: string; filePath: string }) {
  const res = await fetch('/api/documentos', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...data }),
  });
  if (!res.ok) throw new Error('update_document_failed');
  return res.json();
}

export async function deleteDocumentClient(id: number) {
  const res = await fetch(`/api/documentos?id=${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('delete_document_failed');
  return res.json();
}

export async function fetchDocumentsByExpedienteClient(expedienteId: number) {
  const res = await fetch(`/api/documentos?expedienteId=${expedienteId}`);
  if (!res.ok) throw new Error('documents_by_expediente_failed');
  return res.json();
}

// ----- Búsqueda -----
export async function searchClient(filters: Record<string, unknown>) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  
  const res = await fetch(`/api/search?${params.toString()}`);
  if (!res.ok) throw new Error('search_failed');
  return res.json();
}

export async function getSearchFiltersClient() {
  const res = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'filters' }),
  });
  if (!res.ok) throw new Error('filters_failed');
  return res.json();
}

// ----- Reportes -----
export async function getReportsClient() {
  const res = await fetch('/api/reports');
  if (!res.ok) throw new Error('reports_failed');
  return res.json();
}



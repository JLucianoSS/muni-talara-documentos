export type ExpedienteState = 'en_tramite' | 'cerrado' | 'pendiente';

export const getExpedienteStateInfo = (state: ExpedienteState) => {
  switch (state) {
    case 'en_tramite':
      return {
        label: 'En trámite',
        color: 'bg-yellow-100 text-yellow-800',
        dotColor: 'bg-yellow-500'
      };
    case 'cerrado':
      return {
        label: 'Cerrado',
        color: 'bg-green-100 text-green-800',
        dotColor: 'bg-green-500'
      };
    case 'pendiente':
      return {
        label: 'Pendiente',
        color: 'bg-blue-100 text-blue-800',
        dotColor: 'bg-blue-500'
      };
    default:
      return {
        label: state,
        color: 'bg-gray-100 text-gray-800',
        dotColor: 'bg-gray-500'
      };
  }
};

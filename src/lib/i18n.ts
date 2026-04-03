export const dictionary = {
  en: {
    appName: 'PixelMouse',
    accounts: 'Accounts',
    contacts: 'Contacts',
    tags: 'Tags',
    templates: 'Templates',
    campaigns: 'Campaigns',
    rules: 'Rules',
    helper: 'Helper'
  },
  es: {
    appName: 'PixelMouse',
    accounts: 'Cuentas',
    contacts: 'Contactos',
    tags: 'Etiquetas',
    templates: 'Plantillas',
    campaigns: 'Campañas',
    rules: 'Reglas',
    helper: 'Asistente'
  }
} as const;

export type Lang = keyof typeof dictionary;

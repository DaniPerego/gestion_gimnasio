// localStorage data layer for demo mode
// Replaces Prisma with client-side localStorage storage

// ===== TypeScript Interfaces =====

export interface Usuario {
  id: string;
  email: string;
  password: string;
  nombre: string;
  rol: string;
  permisoSocios: boolean;
  permisoPlanes: boolean;
  permisoSuscripciones: boolean;
  permisoAsistencias: boolean;
  permisoReportes: boolean;
  permisoConfiguracion: boolean;
  permisoUsuarios: boolean;
  permisoTransacciones: boolean;
  createdAt: Date;
  updatedAt: Date;
  esProfesorCrossfit: boolean;
  esProfesorMusculacion: boolean;
}

export interface Configuracion {
  id: string;
  nombreGimnasio: string;
  colorPrimario: string;
  colorSecundario: string;
  logoUrl: string | null;
  fondoUrl: string | null;
  updatedAt: Date;
}

export interface Socio {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  email: string | null;
  telefono: string | null;
  fechaNacimiento: Date | null;
  genero: string | null;
  direccion: string | null;
  fotoUrl: string | null;
  contactoEmergencia: string | null;
  telefonoEmergencia: string | null;
  condicionesMedicas: string | null;
  objetivo: string | null;
  activo: boolean;
  esLibre: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plan {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  duracionMeses: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  allowsCrossfit: boolean;
  allowsMusculacion: boolean;
}

export interface Suscripcion {
  id: string;
  socioId: string;
  planId: string;
  fechaInicio: Date;
  fechaFin: Date;
  activa: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaccion {
  id: string;
  suscripcionId: string;
  tipoPago: string;
  monto: number;
  fecha: Date;
  metodoPago: string;
  notas: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Asistencia {
  id: string;
  socioId: string;
  fecha: Date;
  modalidad: string | null;
}

export interface CuentaCorriente {
  id: string;
  socioId: string;
  saldoDeuda: number;
  saldoCredito: number;
  descripcion: string | null;
  estado: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MovimientoCuentaCorriente {
  id: string;
  cuentaCorrienteId: string;
  tipo: string;
  monto: number;
  descripcion: string;
  transaccionId: string | null;
  createdAt: Date;
}

// ===== localStorage helpers =====

const KEYS = {
  usuarios: 'gym_usuarios',
  configuracion: 'gym_configuracion',
  socios: 'gym_socios',
  planes: 'gym_planes',
  suscripciones: 'gym_suscripciones',
  transacciones: 'gym_transacciones',
  asistencias: 'gym_asistencias',
  cuentasCorrientes: 'gym_cuentas_corrientes',
  movimientosCuentaCorriente: 'gym_movimientos_cc',
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCollection<T>(key: string): any[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setCollection(key: string, data: any[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toAny(val: any): any {
  return val;
}

function parseDate(val: unknown): Date {
  if (val instanceof Date) return val;
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) return new Date(val);
  return new Date(val as string);
}

// ===== CRUD: Usuarios =====

export const UsuariosDB = {
  findUnique(where: { id?: string; email?: string }): Usuario | null {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = getCollection<any>(KEYS.usuarios);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const found = items.find((u: any) => {
      if (where.id) return u.id === where.id;
      if (where.email) return u.email === where.email;
      return false;
    });
    return found ? { ...found, createdAt: parseDate(found.createdAt), updatedAt: parseDate(found.updatedAt) } : null;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findMany(opts?: any): Usuario[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let items: any[] = getCollection<any>(KEYS.usuarios);
    if (opts?.where?.OR) {
      items = filterByOR(items, opts.where.OR);
    }
    if (opts?.orderBy?.createdAt === 'desc') {
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    if (opts?.skip !== undefined && opts?.take !== undefined) {
      items = items.slice(opts.skip, opts.skip + opts.take);
    }
    return items.map(u => ({ ...u, createdAt: parseDate(u.createdAt), updatedAt: parseDate(u.updatedAt) }));
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  count(opts?: any): number {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let items: any[] = getCollection<any>(KEYS.usuarios);
    if (opts?.where?.OR) {
      items = filterByOR(items, opts.where.OR);
    }
    return items.length;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create(data: any): Usuario {
    const items = getCollection<any>(KEYS.usuarios);
    const now = new Date();
    const newItem = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    items.push(newItem);
    setCollection(KEYS.usuarios, items);
    return newItem;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update(where: { id: string }, data: any): Usuario {
    const items = getCollection<any>(KEYS.usuarios);
    const idx = items.findIndex(u => u.id === where.id);
    if (idx === -1) throw new Error('Usuario not found');
    items[idx] = { ...items[idx], ...data, updatedAt: new Date() };
    setCollection(KEYS.usuarios, items);
    return items[idx];
  },

  delete(where: { id: string }): void {
    const items = getCollection<any>(KEYS.usuarios);
    setCollection(KEYS.usuarios, items.filter(u => u.id !== where.id));
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  upsert(where: { email: string }, create: any, update: any): Usuario {
    const existing = this.findUnique(where);
    if (existing) {
      return this.update({ id: existing.id }, update);
    }
    return this.create(create);
  },
};

// ===== CRUD: Configuracion =====

export const ConfiguracionDB = {
  findFirst(): Configuracion | null {
    const items = getCollection<any>(KEYS.configuracion);
    if (items.length === 0) return null;
    const c = items[0];
    return { ...c, updatedAt: parseDate(c.updatedAt) };
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create(data: any): Configuracion {
    const items = getCollection<any>(KEYS.configuracion);
    const newItem = { ...data, id: crypto.randomUUID(), updatedAt: new Date() };
    items.push(newItem);
    setCollection(KEYS.configuracion, items);
    return newItem;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update(where: { id: string }, data: any): Configuracion {
    const items = getCollection<any>(KEYS.configuracion);
    const idx = items.findIndex(c => c.id === where.id);
    if (idx === -1) throw new Error('Configuracion not found');
    items[idx] = { ...items[idx], ...data, updatedAt: new Date() };
    setCollection(KEYS.configuracion, items);
    return items[idx];
  },
};

// ===== CRUD: Socios =====

export const SociosDB = {
  findUnique(where: { id?: string; dni?: string }): Socio | null {
    const items = getCollection<any>(KEYS.socios);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const found = items.find((s: any) => {
      if (where.id) return s.id === where.id;
      if (where.dni) return s.dni === where.dni;
      return false;
    });
    if (!found) return null;
    return { ...found, createdAt: parseDate(found.createdAt), updatedAt: parseDate(found.updatedAt), fechaNacimiento: found.fechaNacimiento ? parseDate(found.fechaNacimiento) : null };
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findMany(opts?: any): any[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let items: any[] = getCollection<any>(KEYS.socios);

    if (opts?.where?.activo !== undefined) {
      items = items.filter(s => s.activo === opts.where.activo);
    }

    if (opts?.where?.OR) {
      items = filterByOR(items, opts.where.OR);
    }

    if (opts?.include?.cuentaCorriente) {
      const ccItems = getCollection<any>(KEYS.cuentasCorrientes);
      items = items.map(s => ({
        ...s,
        cuentaCorriente: ccItems.find(cc => cc.socioId === s.id) || null,
      }));
    }

    if (opts?.orderBy) {
      const order = Array.isArray(opts.orderBy) ? opts.orderBy[0] : opts.orderBy;
      const key = Object.keys(order)[0];
      const dir = order[key];
      items.sort((a, b) => {
        const aVal = String(a[key] || '');
        const bVal = String(b[key] || '');
        return dir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
    }

    if (opts?.skip !== undefined && opts?.take !== undefined) {
      items = items.slice(opts.skip, opts.skip + opts.take);
    }

    return items;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  count(opts?: any): number {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let items: any[] = getCollection<any>(KEYS.socios);
    if (opts?.where?.activo !== undefined) {
      items = items.filter(s => s.activo === opts.where.activo);
    }
    if (opts?.where?.OR) {
      items = filterByOR(items, opts.where.OR);
    }
    return items.length;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create(data: any): Socio {
    const items = getCollection<any>(KEYS.socios);
    const now = new Date();
    const newItem = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    items.push(newItem);
    setCollection(KEYS.socios, items);
    return newItem;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update(where: { id: string }, data: any): Socio {
    const items = getCollection<any>(KEYS.socios);
    const idx = items.findIndex(s => s.id === where.id);
    if (idx === -1) throw new Error('Socio not found');
    items[idx] = { ...items[idx], ...data, updatedAt: new Date() };
    setCollection(KEYS.socios, items);
    return items[idx];
  },

  delete(where: { id: string }): void {
    const items = getCollection<any>(KEYS.socios);
    setCollection(KEYS.socios, items.filter(s => s.id !== where.id));
  },
};

// ===== CRUD: Planes =====

export const PlanesDB = {
  findUnique(where: { id: string }): Plan | null {
    const items = getCollection<any>(KEYS.planes);
    const found = items.find(p => p.id === where.id);
    if (!found) return null;
    return { ...found, precio: Number(found.precio), createdAt: parseDate(found.createdAt), updatedAt: parseDate(found.updatedAt) };
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findMany(opts?: any): any[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let items: any[] = getCollection<any>(KEYS.planes);
    if (opts?.where?.activo !== undefined) {
      items = items.filter(p => p.activo === opts.where.activo);
    }
    if (opts?.orderBy?.precio === 'asc') {
      items.sort((a, b) => Number(a.precio) - Number(b.precio));
    }
    return items.map(p => ({ ...p, precio: Number(p.precio) }));
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create(data: any): Plan {
    const items = getCollection<any>(KEYS.planes);
    const now = new Date();
    const newItem = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    items.push(newItem);
    setCollection(KEYS.planes, items);
    return newItem;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update(where: { id: string }, data: any): Plan {
    const items = getCollection<any>(KEYS.planes);
    const idx = items.findIndex(p => p.id === where.id);
    if (idx === -1) throw new Error('Plan not found');
    items[idx] = { ...items[idx], ...data, updatedAt: new Date() };
    setCollection(KEYS.planes, items);
    return items[idx];
  },

  delete(where: { id: string }): void {
    const items = getCollection<any>(KEYS.planes);
    setCollection(KEYS.planes, items.filter(p => p.id !== where.id));
  },
};

// ===== CRUD: Suscripciones =====

export const SuscripcionesDB = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findUnique(where: { id: string }, include?: any): any {
    const items = getCollection<any>(KEYS.suscripciones);
    const item = items.find(s => s.id === where.id);
    if (!item) return null;
    return enrichSuscripcion(item, include);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findFirst(where: any): any {
    const items = getCollection<any>(KEYS.suscripciones);
    return items.find(s => {
      if (where.socioId !== undefined && s.socioId !== where.socioId) return false;
      if (where.planId !== undefined && s.planId !== where.planId) return false;
      if (where.activa !== undefined && s.activa !== where.activa) return false;
      return true;
    }) || null;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findMany(opts?: any): any[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let items: any[] = getCollection<any>(KEYS.suscripciones);

    if (opts?.where) {
      items = items.filter(s => matchesWhere(s, opts.where));
    }

    if (opts?.orderBy?.createdAt === 'desc') {
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    if (opts?.skip !== undefined && opts?.take !== undefined) {
      items = items.slice(opts.skip, opts.skip + opts.take);
    }

    return items.map(s => enrichSuscripcion(s, opts?.include));
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  count(opts?: any): number {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let items: any[] = getCollection<any>(KEYS.suscripciones);
    if (opts?.where) {
      items = items.filter(s => matchesWhere(s, opts.where));
    }
    return items.length;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create(data: any): Suscripcion {
    const items = getCollection<any>(KEYS.suscripciones);
    const now = new Date();
    const newItem = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    items.push(newItem);
    setCollection(KEYS.suscripciones, items);
    return newItem;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update(where: { id: string }, data: any): Suscripcion {
    const items = getCollection<any>(KEYS.suscripciones);
    const idx = items.findIndex(s => s.id === where.id);
    if (idx === -1) throw new Error('Suscripcion not found');
    items[idx] = { ...items[idx], ...data, updatedAt: new Date() };
    setCollection(KEYS.suscripciones, items);
    return items[idx];
  },

  delete(where: { id: string }): void {
    const items = getCollection<any>(KEYS.suscripciones);
    setCollection(KEYS.suscripciones, items.filter(s => s.id !== where.id));
  },
};

// ===== CRUD: Transacciones =====

export const TransaccionesDB = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findUnique(where: { id: string }, include?: any): any {
    const items = getCollection<any>(KEYS.transacciones);
    const item = items.find(t => t.id === where.id);
    if (!item) return null;
    return enrichTransaccion(item, include);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findMany(opts?: any): any[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let items: any[] = getCollection<any>(KEYS.transacciones);

    if (opts?.where) {
      items = filterTransaccionesByWhere(items, opts.where);
    }

    if (opts?.orderBy?.fecha === 'desc') {
      items.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }

    if (opts?.skip !== undefined && opts?.take !== undefined) {
      items = items.slice(opts.skip, opts.skip + opts.take);
    }

    return items.map(t => enrichTransaccion(t, opts?.include));
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  count(opts?: any): number {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let items: any[] = getCollection<any>(KEYS.transacciones);
    if (opts?.where) {
      items = filterTransaccionesByWhere(items, opts.where);
    }
    return items.length;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  aggregate(opts: any): { _sum: { monto: number | null } } {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let items: any[] = getCollection<any>(KEYS.transacciones);
    if (opts.where) {
      items = filterTransaccionesByWhere(items, opts.where);
    }
    const sum = items.reduce((acc, t) => acc + Number(t.monto || 0), 0);
    return { _sum: { monto: sum || null } };
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create(data: any): Transaccion {
    const items = getCollection<any>(KEYS.transacciones);
    const now = new Date();
    const newItem = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    items.push(newItem);
    setCollection(KEYS.transacciones, items);
    return newItem;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update(where: { id: string }, data: any): Transaccion {
    const items = getCollection<any>(KEYS.transacciones);
    const idx = items.findIndex(t => t.id === where.id);
    if (idx === -1) throw new Error('Transaccion not found');
    items[idx] = { ...items[idx], ...data, updatedAt: new Date() };
    setCollection(KEYS.transacciones, items);
    return items[idx];
  },

  delete(where: { id: string }): void {
    const items = getCollection<any>(KEYS.transacciones);
    setCollection(KEYS.transacciones, items.filter(t => t.id !== where.id));
  },
};

// ===== CRUD: Asistencias =====

export const AsistenciasDB = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findMany(opts?: any): any[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let items: any[] = getCollection<any>(KEYS.asistencias);

    if (opts?.where) {
      items = filterAsistenciasByWhere(items, opts.where);
    }

    if (opts?.orderBy?.fecha === 'desc') {
      items.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    } else if (opts?.orderBy?.fecha === 'asc') {
      items.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    }

    if (opts?.skip !== undefined && opts?.take !== undefined) {
      items = items.slice(opts.skip, opts.skip + opts.take);
    }

    if (opts?.include?.socio) {
      const socios = getCollection<any>(KEYS.socios);
      items = items.map(a => ({
        ...a,
        socio: socios.find(s => s.id === a.socioId) || null,
      }));
    }

    return items;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  count(opts?: any): number {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let items: any[] = getCollection<any>(KEYS.asistencias);
    if (opts?.where) {
      items = filterAsistenciasByWhere(items, opts.where);
    }
    return items.length;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create(data: any): Asistencia {
    const items = getCollection<any>(KEYS.asistencias);
    const newItem = { id: crypto.randomUUID(), socioId: data.socioId, fecha: data.fecha, modalidad: data.modalidad ?? null };
    items.push(newItem);
    setCollection(KEYS.asistencias, items);
    return newItem;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update(where: { id: string }, data: any): Asistencia {
    const items = getCollection<any>(KEYS.asistencias);
    const idx = items.findIndex(a => a.id === where.id);
    if (idx === -1) throw new Error('Asistencia not found');
    items[idx] = { ...items[idx], ...data };
    setCollection(KEYS.asistencias, items);
    return items[idx];
  },
};

// ===== CRUD: CuentaCorriente =====

export const CuentasCorrientesDB = {
  findUnique(where: { id?: string; socioId?: string }): CuentaCorriente | null {
    const items = getCollection<any>(KEYS.cuentasCorrientes);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const found = items.find((cc: any) => {
      if (where.id) return cc.id === where.id;
      if (where.socioId) return cc.socioId === where.socioId;
      return false;
    });
    return found || null;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create(data: any): CuentaCorriente {
    const items = getCollection<any>(KEYS.cuentasCorrientes);
    const now = new Date();
    const newItem = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    items.push(newItem);
    setCollection(KEYS.cuentasCorrientes, items);
    return newItem;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update(where: { id: string }, data: any): CuentaCorriente {
    const items = getCollection<any>(KEYS.cuentasCorrientes);
    const idx = items.findIndex(cc => cc.id === where.id);
    if (idx === -1) throw new Error('CuentaCorriente not found');
    items[idx] = { ...items[idx], ...data, updatedAt: new Date() };
    setCollection(KEYS.cuentasCorrientes, items);
    return items[idx];
  },
};

// ===== CRUD: MovimientosCuentaCorriente =====

export const MovimientosCCDB = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findMany(opts?: any): any[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let items: any[] = getCollection<any>(KEYS.movimientosCuentaCorriente);
    if (opts?.where?.cuentaCorrienteId) {
      items = items.filter(m => m.cuentaCorrienteId === opts.where.cuentaCorrienteId);
    }
    if (opts?.orderBy?.createdAt === 'desc') {
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return items;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create(data: any): MovimientoCuentaCorriente {
    const items = getCollection<any>(KEYS.movimientosCuentaCorriente);
    const newItem = { ...data, id: crypto.randomUUID(), createdAt: new Date() };
    items.push(newItem);
    setCollection(KEYS.movimientosCuentaCorriente, items);
    return newItem;
  },
};

// ===== Helper functions =====

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filterByOR(items: any[], orConditions: any[]): any[] {
  return items.filter(item => {
    return orConditions.some(condition => {
      for (const [field, value] of Object.entries(condition)) {
        if (typeof value === 'object' && value !== null && 'contains' in value) {
          const searchVal = String((value as any).contains || '').toLowerCase();
          const itemVal = String(item[field] || '').toLowerCase();
          if (!itemVal.includes(searchVal)) return false;
        }
      }
      return true;
    });
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function matchesWhere(item: any, where: any): boolean {
  for (const [key, value] of Object.entries(where)) {
    if (key === 'OR') return true;
    if (key === 'fechaFin' && typeof value === 'object' && value !== null) {
      const fechaFin = new Date(item.fechaFin);
      const dateFilter = value as any;
      if (dateFilter.lt && fechaFin >= new Date(dateFilter.lt)) return false;
      if (dateFilter.gte && fechaFin < new Date(dateFilter.gte)) return false;
      if (dateFilter.lte && fechaFin > new Date(dateFilter.lte)) return false;
      continue;
    }
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      continue;
    }
    if (item[key] !== value) return false;
  }
  return true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filterTransaccionesByWhere(items: any[], where: any): any[] {
  return items.filter(t => {
    if (where.fecha && typeof where.fecha === 'object') {
      const fecha = new Date(t.fecha);
      const dateFilter = where.fecha;
      if (dateFilter.gte && fecha < new Date(dateFilter.gte)) return false;
      if (dateFilter.lte && fecha > new Date(dateFilter.lte)) return false;
    }
    return true;
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filterAsistenciasByWhere(items: any[], where: any): any[] {
  return items.filter(a => {
    if (where.fecha && typeof where.fecha === 'object') {
      const fecha = new Date(a.fecha);
      const dateFilter = where.fecha;
      if (dateFilter.gte && fecha < new Date(dateFilter.gte)) return false;
      if (dateFilter.lt && fecha >= new Date(dateFilter.lt)) return false;
      if (dateFilter.lte && fecha > new Date(dateFilter.lte)) return false;
    }
    if (where.socio && typeof where.socio === 'object') {
      const socios = getCollection<any>(KEYS.socios);
      const socio = socios.find(s => s.id === a.socioId);
      if (!socio) return false;
      const socioFilter = where.socio;
      if (socioFilter.suscripciones && typeof socioFilter.suscripciones === 'object') {
        const susFilter = socioFilter.suscripciones;
        if (susFilter.some && typeof susFilter.some === 'object') {
          const someFilter = susFilter.some;
          const subs = getCollection<any>(KEYS.suscripciones);
          const planes = getCollection<any>(KEYS.planes);
          const hasMatch = subs.some(s => {
            if (s.socioId !== socio.id) return false;
            if (someFilter.activa !== undefined && s.activa !== someFilter.activa) return false;
            if (someFilter.plan && typeof someFilter.plan === 'object') {
              const plan = planes.find(p => p.id === s.planId);
              if (!plan) return false;
              const planFilter = someFilter.plan;
              for (const [pk, pv] of Object.entries(planFilter)) {
                if (plan[pk] !== pv) return false;
              }
            }
            return true;
          });
          if (!hasMatch) return false;
        }
      }
    }
    return true;
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enrichSuscripcion(sub: any, include?: any): any {
  const result = { ...sub };
  if (include?.socio) {
    const socios = getCollection<any>(KEYS.socios);
    result.socio = socios.find(s => s.id === sub.socioId) || null;
  }
  if (include?.plan) {
    const planes = getCollection<any>(KEYS.planes);
    result.plan = planes.find(p => p.id === sub.planId) || null;
    if (result.plan) result.plan.precio = Number(result.plan.precio);
  }
  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enrichTransaccion(trans: any, include?: any): any {
  const result = { ...trans };
  if (include?.suscripcion) {
    const subs = getCollection<any>(KEYS.suscripciones);
    const sub = subs.find(s => s.id === trans.suscripcionId);
    if (sub) {
      result.suscripcion = enrichSuscripcion(sub, include.suscripcion.include);
    }
  }
  return result;
}

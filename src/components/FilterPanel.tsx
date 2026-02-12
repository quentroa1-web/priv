import { useMemo } from 'react';
import { SlidersHorizontal, MapPin, DollarSign, Shield, Search } from 'lucide-react';
import { COLOMBIA_LOCATIONS } from '../data/colombiaLocations';

interface FilterPanelProps {
  filters: any;
  onFilterChange: (filters: any) => void;
}

export function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  const handleGenderChange = (sex: string) => {
    onFilterChange({ ...filters, sex: filters.sex === sex ? 'all' : sex });
  };

  const handleLocationChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    if (key === 'departamento') {
      newFilters.ciudad = 'all';
      newFilters.barrio = 'all';
    } else if (key === 'ciudad') {
      newFilters.barrio = 'all';
    }
    onFilterChange(newFilters);
  };

  const currentDepto = useMemo(() =>
    COLOMBIA_LOCATIONS.find(d => d.id === filters.departamento),
    [filters.departamento]
  );

  const currentCiudad = useMemo(() =>
    currentDepto?.ciudades.find(c => c.id === filters.ciudad),
    [currentDepto, filters.ciudad]
  );

  const hasActiveFilters = (filters.sex && filters.sex !== 'all') ||
    (filters.departamento && filters.departamento !== 'all') ||
    filters.onlyVerified || filters.onlyOnline || filters.onlyPremium ||
    filters.minAge > 18 || filters.maxAge < 65 || filters.minPrice > 0 ||
    filters.keyword;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-rose-600" />
          <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={() => onFilterChange({
              keyword: '',
              sex: 'all',
              departamento: 'all',
              ciudad: 'all',
              barrio: 'all',
              zonaEspecifica: '',
              minAge: 18,
              maxAge: 65,
              minPrice: 0,
              maxPrice: 5000000,
              onlyVerified: false,
              onlyOnline: false,
              onlyPremium: false
            })}
            className="text-xs text-rose-500 font-semibold hover:underline"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Sex Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <span className="w-4 h-4 flex items-center justify-center">🧑</span>
            Categoría
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'woman', name: 'Mujer' },
              { id: 'man', name: 'Hombre' },
              { id: 'transgender', name: 'Transexual' },
              { id: 'gigolo', name: 'Gigoló' }
            ].map((option) => (
              <label key={option.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.sex === option.id}
                  onChange={() => handleGenderChange(option.id)}
                  className="w-4 h-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
                />
                <span className={`text-sm transition-colors ${filters.sex === option.id ? 'text-rose-600 font-bold' : 'text-gray-700 group-hover:text-rose-600'}`}>
                  {option.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Location - Colombia */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <MapPin className="w-4 h-4 text-rose-500" />
            Ubicación
          </label>

          <div className="space-y-3">
            {/* Departamento Selector */}
            <div>
              <label className="block text-[10px] text-gray-500 mb-1 font-bold uppercase tracking-wider">Departamento</label>
              <select
                value={filters.departamento}
                onChange={(e) => handleLocationChange('departamento', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
              >
                <option value="">Todos</option>
                {COLOMBIA_LOCATIONS.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Ciudad Selector */}
            <div>
              <label className="block text-[10px] text-gray-500 mb-1 font-bold uppercase tracking-wider">Ciudad</label>
              <select
                disabled={!filters.departamento}
                value={filters.ciudad}
                onChange={(e) => handleLocationChange('ciudad', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <option value="">Todas</option>
                {currentDepto?.ciudades.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Barrio Selector */}
            <div>
              <label className="block text-[10px] text-gray-500 mb-1 font-bold uppercase tracking-wider">Barrio</label>
              <select
                disabled={!filters.ciudad}
                value={filters.barrio}
                onChange={(e) => handleLocationChange('barrio', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <option value="">Todos</option>
                {currentCiudad?.barrios.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Age Range */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-3 block">
            Edad: <span className="text-rose-600">{filters.minAge} - {filters.maxAge}</span>
          </label>
          <div className="space-y-4">
            <input
              type="range" min="18" max="65"
              value={filters.minAge}
              onChange={(e) => onFilterChange({ ...filters, minAge: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <input
              type="range" min="18" max="65"
              value={filters.maxAge}
              onChange={(e) => onFilterChange({ ...filters, maxAge: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            Presupuesto Máximo
          </label>
          <div className="relative">
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => onFilterChange({ ...filters, maxPrice: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent pl-8"
              placeholder="Ej: 200000"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
          </div>
        </div>

        {/* Verification Filters */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Shield className="w-4 h-4 text-blue-500" />
            Confianza
          </label>
          <div className="space-y-3">
            {[
              { id: 'onlyVerified', name: 'Verificados con ID', color: 'text-rose-600' },
              { id: 'onlyOnline', name: 'En línea ahora', color: 'text-green-600' },
              { id: 'onlyPremium', name: 'Exclusivos Premium', color: 'text-amber-600' }
            ].map((item) => (
              <label key={item.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100">
                <span className="text-sm text-gray-700 font-medium">{item.name}</span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters[item.id]}
                    onChange={(e) => onFilterChange({ ...filters, [item.id]: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={() => onFilterChange(filters)}
            className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-rose-100 transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
}

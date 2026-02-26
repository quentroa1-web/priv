import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, X, MapPin, Filter, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import COLOMBIA_LOCATIONS from '../data/colombiaLocations';

interface SearchFilters {
  keyword: string;
  sex: string;
  departamento: string;
  ciudad: string;
  barrio: string;
  zonaEspecifica: string;
  minPrice: number;
  maxPrice: number;
  minAge: number;
  maxAge: number;
  onlyVerified: boolean;
  onlyOnline: boolean;
  onlyPremium: boolean;
}

interface AdvancedSearchBarProps {
  onSearch: (filters: SearchFilters) => void;
}

export const AdvancedSearchBar: React.FC<AdvancedSearchBarProps> = ({ onSearch }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '',
    sex: '',
    departamento: '',
    ciudad: '',
    barrio: '',
    zonaEspecifica: '',
    minPrice: 0,
    maxPrice: 5000000,
    minAge: 18,
    maxAge: 65,
    onlyVerified: false,
    onlyOnline: false,
    onlyPremium: false
  });

  // Bloquear scroll del body cuando el panel está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const ciudadesDisponibles = useMemo(() => {
    if (!filters.departamento) return [];
    const depto = COLOMBIA_LOCATIONS.find(d => d.id === filters.departamento);
    return depto?.ciudades || [];
  }, [filters.departamento]);

  const barriosDisponibles = useMemo(() => {
    if (!filters.departamento || !filters.ciudad) return [];
    const depto = COLOMBIA_LOCATIONS.find(d => d.id === filters.departamento);
    const ciudad = depto?.ciudades.find(c => c.id === filters.ciudad);
    return ciudad?.barrios || [];
  }, [filters.departamento, filters.ciudad]);

  const getLocationDisplay = () => {
    const parts: string[] = [];
    if (filters.departamento) {
      const depto = COLOMBIA_LOCATIONS.find(d => d.id === filters.departamento);
      if (depto) parts.push(depto.name);
    }
    if (filters.ciudad) {
      const depto = COLOMBIA_LOCATIONS.find(d => d.id === filters.departamento);
      const ciudad = depto?.ciudades.find(c => c.id === filters.ciudad);
      if (ciudad) parts.push(ciudad.name);
    }
    if (filters.barrio) {
      const depto = COLOMBIA_LOCATIONS.find(d => d.id === filters.departamento);
      const ciudad = depto?.ciudades.find(c => c.id === filters.ciudad);
      const barrio = ciudad?.barrios.find(b => b.id === filters.barrio);
      if (barrio) parts.push(barrio.name);
    }
    if (filters.zonaEspecifica) {
      parts.push(filters.zonaEspecifica);
    }
    return parts.join(' › ') || t('search.selectLocation');
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      if (key === 'departamento') {
        newFilters.ciudad = '';
        newFilters.barrio = '';
        newFilters.zonaEspecifica = '';
      }
      if (key === 'ciudad') {
        newFilters.barrio = '';
        newFilters.zonaEspecifica = '';
      }
      if (key === 'barrio') {
        newFilters.zonaEspecifica = '';
      }
      return newFilters;
    });
  };

  const handleSearch = () => {
    onSearch(filters);
    setIsOpen(false);
  };

  const handleClear = () => {
    setFilters({
      keyword: '',
      sex: '',
      departamento: '',
      ciudad: '',
      barrio: '',
      zonaEspecifica: '',
      minPrice: 0,
      maxPrice: 5000000,
      minAge: 18,
      maxAge: 65,
      onlyVerified: false,
      onlyOnline: false,
      onlyPremium: false
    });
  };

  const hasActiveFilters = filters.sex || filters.departamento || filters.minAge > 18 || filters.maxAge < 65 || filters.onlyVerified || filters.onlyOnline || filters.onlyPremium;

  const activeFiltersCount = [
    filters.sex,
    filters.departamento,
    filters.onlyVerified,
    filters.onlyOnline,
    filters.onlyPremium,
    filters.minAge > 18,
    filters.maxAge < 65
  ].filter(Boolean).length;

  return (
    <div className="w-full relative">
      {/* ==================== BARRA DE BÚSQUEDA PRINCIPAL ==================== */}
      <div className="flex items-center gap-2 bg-white rounded-full shadow-md px-4 py-1.5 border border-rose-100 hover:shadow-lg transition-shadow group overflow-hidden">
        <Search className="w-4 h-4 text-rose-500 flex-shrink-0 group-focus-within:scale-110 transition-transform" />

        <input
          type="text"
          value={filters.keyword}
          onChange={(e) => handleFilterChange('keyword', e.target.value)}
          placeholder={t('search.placeholder')}
          className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 text-sm text-gray-700 placeholder:text-gray-400"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />

        <div className="h-4 w-px bg-gray-200 hidden sm:block"></div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-600 rounded-full hover:bg-rose-50 hover:border-rose-100 hover:text-rose-600 transition-all font-semibold text-xs whitespace-nowrap flex-shrink-0"
        >
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline truncate max-w-[120px]">{getLocationDisplay()}</span>
          {activeFiltersCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <button
          onClick={handleSearch}
          aria-label={t('common.search')}
          className="bg-rose-500 text-white p-2 rounded-full hover:bg-rose-600 transition-colors shadow-sm"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ==================== PANEL DE FILTROS (MODAL FULLSCREEN) ==================== */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-start justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel - Full en móvil, centrado en desktop */}
          <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:w-[95vw] sm:max-w-3xl sm:mt-4 sm:rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* ===== HEADER FIJO ===== */}
            <div className="flex-shrink-0 bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-white" />
                <div>
                  <h3 className="text-white font-bold text-sm sm:text-base">{t('search.advancedFilters')}</h3>
                  <p className="text-rose-100 text-[10px] sm:text-xs">{t('search.filterDescription')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* ===== CONTENIDO SCROLLEABLE ===== */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">

              {/* --- TIPO DE ANUNCIANTE --- */}
              <div>
                <label className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                  {t('search.sex')}
                </label>
                <div className="grid grid-cols-5 gap-1.5 mt-2">
                  {[
                    { value: '', label: t('sex.all'), icon: '👥' },
                    { value: 'woman', label: t('sex.woman'), icon: '👩' },
                    { value: 'man', label: t('sex.man'), icon: '👨' },
                    { value: 'transgender', label: t('sex.transgender'), icon: '⚧️' },
                    { value: 'gigolo', label: t('sex.gigolo'), icon: '🕺' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange('sex', option.value)}
                      className={`py-2 rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-0.5 ${filters.sex === option.value
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md scale-105'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      <span className="text-base">{option.icon}</span>
                      <span className="text-[10px] sm:text-xs leading-tight">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* --- UBICACIÓN JERÁRQUICA --- */}
              <div className="p-3 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-100">
                <label className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {t('search.location')}
                </label>

                {/* Breadcrumb */}
                {(filters.departamento || filters.ciudad || filters.barrio) && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 my-2 flex-wrap">
                    <span className="text-rose-500">📍</span>
                    {filters.departamento && (
                      <>
                        <span className="bg-white px-1.5 py-0.5 rounded text-[11px]">
                          {COLOMBIA_LOCATIONS.find(d => d.id === filters.departamento)?.name}
                        </span>
                        {filters.ciudad && <ChevronRight className="w-3 h-3 text-gray-400" />}
                      </>
                    )}
                    {filters.ciudad && (
                      <>
                        <span className="bg-white px-1.5 py-0.5 rounded text-[11px]">
                          {ciudadesDisponibles.find(c => c.id === filters.ciudad)?.name}
                        </span>
                        {filters.barrio && <ChevronRight className="w-3 h-3 text-gray-400" />}
                      </>
                    )}
                    {filters.barrio && (
                      <span className="bg-white px-1.5 py-0.5 rounded text-[11px]">
                        {barriosDisponibles.find(b => b.id === filters.barrio)?.name}
                      </span>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mt-2">
                  {/* Departamento */}
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      {t('search.department')}
                    </label>
                    <select
                      value={filters.departamento}
                      onChange={(e) => handleFilterChange('departamento', e.target.value)}
                      className="w-full px-2 py-1.5 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white text-xs cursor-pointer"
                    >
                      <option value="">{t('search.selectDepartment')}</option>
                      {COLOMBIA_LOCATIONS.map(depto => (
                        <option key={depto.id} value={depto.id}>{depto.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Ciudad */}
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      {t('search.city')}
                    </label>
                    <select
                      value={filters.ciudad}
                      onChange={(e) => handleFilterChange('ciudad', e.target.value)}
                      disabled={!filters.departamento}
                      className={`w-full px-2 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white text-xs cursor-pointer ${!filters.departamento ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-rose-200'
                        }`}
                    >
                      <option value="">{t('search.selectCity')}</option>
                      {ciudadesDisponibles.map(ciudad => (
                        <option key={ciudad.id} value={ciudad.id}>{ciudad.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Barrio */}
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      {t('search.neighborhood')}
                    </label>
                    <select
                      value={filters.barrio}
                      onChange={(e) => handleFilterChange('barrio', e.target.value)}
                      disabled={!filters.ciudad}
                      className={`w-full px-2 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white text-xs cursor-pointer ${!filters.ciudad ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-rose-200'
                        }`}
                    >
                      <option value="">{t('search.selectNeighborhood')}</option>
                      {barriosDisponibles.map(barrio => (
                        <option key={barrio.id} value={barrio.id}>{barrio.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Zona Específica */}
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      {t('search.specificZone')}
                    </label>
                    <input
                      type="text"
                      value={filters.zonaEspecifica}
                      onChange={(e) => handleFilterChange('zonaEspecifica', e.target.value)}
                      placeholder={t('search.zonePlaceholder')}
                      className="w-full px-2 py-1.5 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white text-xs"
                    />
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-gray-500 bg-white/60 px-2 py-1 rounded">
                  💡 <span className="font-medium">{t('search.example')}:</span> Cundinamarca → Soacha → Compartir
                </div>
              </div>

              {/* --- EDAD Y PRECIO --- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Edad */}
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs font-bold text-gray-700 mb-1 block">
                    {t('search.ageRange')}: <span className="text-rose-500">{filters.minAge} - {filters.maxAge}</span>
                  </label>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1">
                      <input
                        type="range" min="18" max="65"
                        value={filters.minAge}
                        onChange={(e) => handleFilterChange('minAge', parseInt(e.target.value))}
                        className="w-full accent-rose-500 h-1.5"
                      />
                      <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
                        <span>18</span>
                        <span>Min</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <input
                        type="range" min="18" max="65"
                        value={filters.maxAge}
                        onChange={(e) => handleFilterChange('maxAge', parseInt(e.target.value))}
                        className="w-full accent-rose-500 h-1.5"
                      />
                      <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
                        <span>Max</span>
                        <span>65</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Precio */}
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs font-bold text-gray-700 mb-1 block">
                    {t('search.priceRange')}: <span className="text-rose-500">${filters.minPrice.toLocaleString()} - ${filters.maxPrice.toLocaleString()}</span>
                  </label>
                  <div className="flex gap-2 items-center mt-2">
                    <input
                      type="number" min="0"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value) || 0)}
                      className="flex-1 w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 text-xs"
                      placeholder="Mín"
                    />
                    <span className="text-gray-300 text-xs">—</span>
                    <input
                      type="number" max="10000"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value) || 0)}
                      className="flex-1 w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 text-xs"
                      placeholder="Máx"
                    />
                  </div>
                </div>
              </div>

              {/* --- FILTROS PREMIUM --- */}
              <div className="p-3 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                <label className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                  <span className="text-amber-500">⭐</span>
                  {t('search.premiumFilters')}
                </label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { key: 'onlyVerified' as const, label: t('search.onlyVerified'), desc: t('search.verifiedDesc'), icon: '✓', color: 'accent-rose-500' },
                    { key: 'onlyOnline' as const, label: t('search.onlyOnline'), desc: t('search.onlineDesc'), icon: '🟢', color: 'accent-green-500' },
                    { key: 'onlyPremium' as const, label: t('search.onlyPremium'), desc: t('search.premiumDesc'), icon: '👑', color: 'accent-amber-500' }
                  ].map(item => (
                    <label
                      key={item.key}
                      className={`flex flex-col items-center gap-1 cursor-pointer p-2 rounded-xl transition-all text-center ${filters[item.key] ? 'bg-white shadow-md ring-2 ring-rose-300' : 'bg-white/60 hover:bg-white'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={filters[item.key]}
                        onChange={(e) => handleFilterChange(item.key, e.target.checked)}
                        className={`w-4 h-4 ${item.color} rounded`}
                      />
                      <span className="text-[10px] sm:text-xs font-medium text-gray-700 leading-tight">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* ===== FOOTER FIJO CON BOTONES ===== */}
            <div className="flex-shrink-0 flex items-center gap-2 p-3 bg-gray-50 border-t border-gray-200">
              {hasActiveFilters && (
                <button
                  onClick={handleClear}
                  className="px-3 py-2 text-gray-500 hover:bg-gray-200 rounded-xl transition text-xs font-medium flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  {t('search.clear')}
                </button>
              )}
              <button
                onClick={handleSearch}
                className="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Search className="w-4 h-4" />
                {t('search.search')} {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

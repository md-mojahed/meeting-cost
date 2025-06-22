import React, { useState } from 'react';
import { DollarSign, Settings, Check } from 'lucide-react';
import { CurrencySettings as CurrencySettingsType } from '../types';

interface CurrencySettingsProps {
  currency: CurrencySettingsType;
  onUpdate: (currency: CurrencySettingsType) => void;
}

const COMMON_CURRENCIES = [
  { symbol: '$', code: 'USD', name: 'US Dollar' },
  { symbol: '€', code: 'EUR', name: 'Euro' },
  { symbol: '£', code: 'GBP', name: 'British Pound' },
  { symbol: '¥', code: 'JPY', name: 'Japanese Yen' },
  { symbol: '₹', code: 'INR', name: 'Indian Rupee' },
  { symbol: '৳', code: 'BDT', name: 'Bangladeshi Taka' },
  { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar' },
  { symbol: 'A$', code: 'AUD', name: 'Australian Dollar' },
];

export function CurrencySettings({ currency, onUpdate }: CurrencySettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customSymbol, setCustomSymbol] = useState('');
  const [customCode, setCustomCode] = useState('');

  const handleQuickSelect = (selectedCurrency: typeof COMMON_CURRENCIES[0]) => {
    onUpdate({
      symbol: selectedCurrency.symbol,
      code: selectedCurrency.code,
      position: currency.position,
    });
  };

  const handleCustomCurrency = () => {
    if (customSymbol.trim() && customCode.trim()) {
      onUpdate({
        symbol: customSymbol.trim(),
        code: customCode.trim().toUpperCase(),
        position: currency.position,
      });
      setCustomSymbol('');
      setCustomCode('');
    }
  };

  const handlePositionChange = (position: 'before' | 'after') => {
    onUpdate({ ...currency, position });
  };

  const formatPreview = (amount: number) => {
    return currency.position === 'before' 
      ? `${currency.symbol}${amount.toFixed(2)}`
      : `${amount.toFixed(2)} ${currency.symbol}`;
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-2xl">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Currency Settings</h2>
            <p className="text-sm text-gray-500">Customize your currency display</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200 hover:scale-105"
        >
          <Settings className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Current Currency Display */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-6 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-800 mb-1">Current Currency</p>
            <p className="text-2xl font-bold text-green-900">{currency.code} ({currency.symbol})</p>
            <p className="text-sm text-green-600 mt-1">Preview: {formatPreview(1234.56)}</p>
          </div>
          <div className="text-green-600">
            <DollarSign className="h-12 w-12" />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Quick Select Currencies */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Select</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {COMMON_CURRENCIES.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => handleQuickSelect(curr)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    currency.code === curr.code
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">{curr.symbol}</div>
                    <div className="text-sm font-medium">{curr.code}</div>
                    <div className="text-xs text-gray-500">{curr.name}</div>
                  </div>
                  {currency.code === curr.code && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Currency */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Currency</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={customSymbol}
                  onChange={(e) => setCustomSymbol(e.target.value)}
                  placeholder="e.g., ৳, ₹, kr"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 text-lg font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency Code
                </label>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  placeholder="e.g., BDT, INR, SEK"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 text-lg font-medium"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleCustomCurrency}
                  disabled={!customSymbol.trim() || !customCode.trim()}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none"
                >
                  Apply Custom
                </button>
              </div>
            </div>
          </div>

          {/* Position Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Symbol Position</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handlePositionChange('before')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                  currency.position === 'before'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-bold mb-2">Before Amount</div>
                  <div className="text-sm text-gray-600">
                    Example: {currency.symbol}1,234.56
                  </div>
                </div>
              </button>
              <button
                onClick={() => handlePositionChange('after')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                  currency.position === 'after'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-bold mb-2">After Amount</div>
                  <div className="text-sm text-gray-600">
                    Example: 1,234.56 {currency.symbol}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
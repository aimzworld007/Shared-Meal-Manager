import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const PREDEFINED_CURRENCIES = ['AED', 'USD', 'EUR', 'GBP', 'INR', 'PKR', 'BDT'];

const CurrencySettings: React.FC = () => {
    const { currency, updateCurrency } = useAuth();
    const [selectedCurrency, setSelectedCurrency] = useState(currency);
    const [customCurrency, setCustomCurrency] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCustom, setIsCustom] = useState(false);

    useEffect(() => {
        if (currency) {
            if (PREDEFINED_CURRENCIES.includes(currency)) {
                setSelectedCurrency(currency);
                setIsCustom(false);
            } else {
                setSelectedCurrency('custom');
                setCustomCurrency(currency);
                setIsCustom(true);
            }
        }
    }, [currency]);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedCurrency(value);
        if (value === 'custom') {
            setIsCustom(true);
        } else {
            setIsCustom(false);
            setCustomCurrency('');
        }
    };

    const handleSave = async () => {
        const newCurrency = (selectedCurrency === 'custom' ? customCurrency : selectedCurrency).toUpperCase();
        if (!newCurrency || newCurrency.length !== 3) {
            alert('Please enter a valid 3-letter currency code (e.g., USD).');
            return;
        }
        
        setIsSubmitting(true);
        try {
            await updateCurrency(newCurrency);
            alert('Currency updated successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to update currency.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Currency Settings</h3>
            </div>
            <div className="p-8 space-y-6">
                <div>
                    <label htmlFor="currency-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Select Currency
                    </label>
                    <select
                        id="currency-select"
                        value={selectedCurrency}
                        onChange={handleSelectChange}
                        className="block w-full sm:w-80 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all appearance-none cursor-pointer"
                    >
                        {PREDEFINED_CURRENCIES.map(code => (
                            <option key={code} value={code}>{code}</option>
                        ))}
                        <option value="custom">Custom...</option>
                    </select>
                </div>

                {isCustom && (
                    <div>
                        <label htmlFor="custom-currency" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Custom Currency Code
                        </label>
                        <input
                            id="custom-currency"
                            type="text"
                            value={customCurrency}
                            onChange={(e) => setCustomCurrency(e.target.value)}
                            maxLength={3}
                            placeholder="E.g., CAD"
                            className="block w-full sm:w-80 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all"
                        />
                    </div>
                )}

                <div className="pt-2">
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-semibold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-colors active:scale-95 disabled:bg-indigo-400 disabled:active:scale-100"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Currency'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CurrencySettings;
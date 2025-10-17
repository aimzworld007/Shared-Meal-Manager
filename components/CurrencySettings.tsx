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
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Currency Settings</h3>
            </div>
            <div className="p-6 space-y-4">
                <div>
                    <label htmlFor="currency-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Select Currency
                    </label>
                    <select
                        id="currency-select"
                        value={selectedCurrency}
                        onChange={handleSelectChange}
                        className="mt-1 block w-full sm:w-80 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        {PREDEFINED_CURRENCIES.map(code => (
                            <option key={code} value={code}>{code}</option>
                        ))}
                        <option value="custom">Custom...</option>
                    </select>
                </div>

                {isCustom && (
                    <div>
                        <label htmlFor="custom-currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Custom Currency Code
                        </label>
                        <input
                            id="custom-currency"
                            type="text"
                            value={customCurrency}
                            onChange={(e) => setCustomCurrency(e.target.value)}
                            maxLength={3}
                            placeholder="E.g., CAD"
                            className="mt-1 block w-full sm:w-80 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"
                        />
                    </div>
                )}

                <div>
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Currency'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CurrencySettings;
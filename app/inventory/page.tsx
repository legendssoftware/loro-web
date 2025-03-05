'use client';

import { motion } from 'framer-motion';

export default function InventoryPage() {
    return (
        <motion.div
            className='flex flex-col items-center justify-center h-screen gap-3 p-4'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <p className='text-sm uppercase font-body'>Inventory Page</p>
        </motion.div>
    );
}

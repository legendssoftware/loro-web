#!/usr/bin/env node

/**
 * Script to update page components with consistent animation patterns
 * This replaces existing basic motion.div animations with the new PageTransition component
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const pagesDir = path.join(__dirname, '../app');
const pattern = '**/*.{tsx,jsx}';
const ignored = ['layout.tsx', '_*.*'];

// Basic template for the updated component using PageTransition
const updatedTemplate = (pageName, className) => `'use client';

import { PageTransition } from '@/components/animations/page-transition';
import { motion } from 'framer-motion';
import { itemVariants } from '@/lib/utils/animations';

export default function ${pageName}() {
    return (
        <PageTransition>
            <div className='${className || 'flex flex-col items-center justify-center h-screen gap-3 p-4'}'>
                <motion.p
                    className='text-sm uppercase font-body'
                    variants={itemVariants}
                >
                    ${pageName.replace(/Page$/, '')} Page
                </motion.p>
            </div>
        </PageTransition>
    );
}`;

// Function to detect if file needs updating
function needsUpdate(content) {
    // Look for basic animation pattern
    return (
        content.includes('motion.div') &&
        content.includes('initial={{ opacity: 0 }}') &&
        content.includes('animate={{ opacity: 1 }}') &&
        !content.includes('PageTransition')
    );
}

// Function to extract the page name from the file content
function extractPageName(content) {
    const match = content.match(/export default function (\w+)/);
    return match ? match[1] : 'Page';
}

// Function to extract className from the file content
function extractClassName(content) {
    const match = content.match(/className=['"](.*?)['"]/);
    return match ? match[1] : '';
}

// Main function
async function updatePages() {
    try {
        // Find all page components
        const files = glob.sync(pattern, { cwd: pagesDir, ignore: ignored });

        let updatedCount = 0;

        for (const file of files) {
            const filePath = path.join(pagesDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');

            if (needsUpdate(content)) {
                const pageName = extractPageName(content);
                const className = extractClassName(content);

                // Create updated content
                const updatedContent = updatedTemplate(pageName, className);

                // Write the updated content
                fs.writeFileSync(filePath, updatedContent, 'utf-8');

                console.log(`✅ Updated ${file}`);
                updatedCount++;
            }
        }
    } catch (error) {}
}

// Run the function
updatePages();

'use client'

import ToggleTheme from '@/components/layout/ToggleTheme'
import React from 'react'
import { Button, ButtonGroup } from "@heroui/button";
import { Card, CardFooter, Image } from "@heroui/react";
import { FaAddressBook, FaTrash } from 'react-icons/fa';
import Footer from '@/components/layout/Footer';

export default function page() {
  return (
    <div className="bg-white dark:bg-black text-black dark:text-white">
      <ToggleTheme />
      <Button
        color="primary"
        variant='shadow'
        startContent={<FaTrash />}
        endContent={<FaAddressBook />}
        // onPress={ }
      >
        Button
      </Button>
      <Footer/>
    </div>
  )
}

import ToggleTheme from '@/components/layout/ToggleTheme'
import React from 'react'
import {Button, ButtonGroup} from "@heroui/button";

export default function page() {
  return (
    <div className="bg-white dark:bg-black text-black dark:text-white">
      <ToggleTheme/>
      <Button color="primary">Button</Button>
    </div>
  )
}

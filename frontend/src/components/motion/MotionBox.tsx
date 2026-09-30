import { Box, BoxProps } from '@chakra-ui/react'
import { HTMLMotionProps, motion, MotionProps } from 'framer-motion'
import { Merge } from 'type-fest'

export type MotionBoxProps = Merge<BoxProps, HTMLMotionProps<'div'>>
export const MotionBox = motion<Omit<BoxProps, keyof MotionProps>>(Box)

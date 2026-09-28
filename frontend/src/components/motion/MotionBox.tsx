import { BoxProps, chakra, shouldForwardProp } from '@chakra-ui/react'
import { HTMLMotionProps, isValidMotionProp, motion } from 'framer-motion'
import { Merge } from 'type-fest'

export type MotionBoxProps = Merge<BoxProps, HTMLMotionProps<'div'>>

const ChakraMotionDiv = chakra(motion.div, {
  shouldForwardProp: (prop) =>
    isValidMotionProp(prop) || shouldForwardProp(prop),
})

export const MotionBox =
  ChakraMotionDiv as unknown as React.ComponentType<MotionBoxProps>

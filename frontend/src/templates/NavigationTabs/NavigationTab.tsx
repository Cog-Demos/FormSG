import { PropsWithChildren } from 'react'
import {
  Link as ReactLink,
  LinkProps as ReactLinkProps,
} from 'react-router-dom'
import { chakra, HTMLChakraProps, useStyles } from '@chakra-ui/react'

const Link = chakra(ReactLink)

type NavigationTabProps = PropsWithChildren<
  ReactLinkProps &
    Omit<HTMLChakraProps<'a'>, keyof ReactLinkProps> & {
      isActive?: boolean
      isDisabled?: boolean
      showReddot?: boolean
    }
>

/** Must be nested inside NavigationTabList component, uses styles provided by that component. */
export const NavigationTab = ({
  isActive,
  isDisabled,
  children,
  ...props
}: NavigationTabProps) => {
  const styles = useStyles()

  if (isDisabled) {
    return (
      <chakra.a
        __css={styles.tab}
        aria-disabled
        display="inline-flex"
        alignItems="center"
      >
        {children}
      </chakra.a>
    )
  }

  return (
    <Link aria-selected={isActive} __css={styles.tab} {...props}>
      {children}
    </Link>
  )
}

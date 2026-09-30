import { MemoryRouter } from 'react-router-dom'
import { Meta, StoryFn } from '@storybook/react'

import { FormColorTheme } from '~shared/types/form/form'
import { FormLogoState } from '~shared/types/form/form_logo'

import { envHandlers } from '~/mocks/msw/handlers/env'
import {
  getCustomLogoResponse,
  getPublicFormResponse,
  getPublicFormWithoutSectionsResponse,
} from '~/mocks/msw/handlers/public-form'

import { getMobileViewParameters } from '~utils/storybook'

import { PublicFormProvider } from '~features/public-form/PublicFormProvider'

import { FormSectionsProvider } from '../FormFields/FormSectionsContext'

import {
  MiniHeader as MiniHeaderComponent,
  MiniHeaderProps,
} from './FormHeader'
import { FormStartPage } from './FormStartPage'

export default {
  title: 'Pages/PublicFormPage/FormStartPage',
  component: FormStartPage,
  decorators: [
    (storyFn) => (
      <MemoryRouter initialEntries={['/12345']}>
        <PublicFormProvider
          formId="61540ece3d4a6e50ac0cc6ff"
          startTime={Date.now()}
        >
          <FormSectionsProvider>{storyFn()}</FormSectionsProvider>
        </PublicFormProvider>
      </MemoryRouter>
    ),
  ],
  parameters: {
    // Required so skeleton "animation" does not hide content.
    chromatic: { pauseAnimationAtEnd: true },
    layout: 'fullscreen',
  },
} as Meta

const Template: StoryFn = () => <FormStartPage />

export const NoEstimatedTime = {
  render: Template,

  parameters: {
    msw: [
      getPublicFormResponse({
        overrides: {
          form: {
            title: 'storybook no estimated time',
            startPage: {
              estTimeTaken: 0,
            },
          },
        },
        delay: 0,
      }),
    ],
  },
}

export const OverflowTitle = {
  render: Template,

  parameters: {
    msw: [
      ...envHandlers,
      getCustomLogoResponse(),
      getPublicFormResponse({
        overrides: {
          form: {
            title:
              'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            startPage: {
              logo: {
                state: FormLogoState.Custom,
                fileId: 'mockFormLogo',
              },
            },
          },
        },
        delay: 0,
      }),
    ],
  },
}

export const OverflowTitleMobile = {
  render: Template,

  parameters: {
    ...getMobileViewParameters(),
    ...OverflowTitle.parameters,
  },
}

export const ColorThemeBrown = {
  render: Template,

  parameters: {
    msw: [
      getPublicFormResponse({
        overrides: {
          form: {
            title: 'storybook test brown theme',
            startPage: {
              colorTheme: FormColorTheme.Brown,
            },
          },
        },
        delay: 0,
      }),
    ],
  },
}

export const ColorThemeGreen = {
  render: Template,

  parameters: {
    msw: [
      getPublicFormResponse({
        overrides: {
          form: {
            title: 'storybook test green theme',
            startPage: {
              colorTheme: FormColorTheme.Green,
            },
          },
        },
        delay: 0,
      }),
    ],
  },
}

export const ColorThemeGrey = {
  render: Template,

  parameters: {
    msw: [
      getPublicFormResponse({
        overrides: {
          form: {
            title: 'storybook test grey theme',
            startPage: {
              colorTheme: FormColorTheme.Grey,
            },
          },
        },
        delay: 0,
      }),
    ],
  },
}

export const ColorThemeOrange = {
  render: Template,

  parameters: {
    msw: [
      getPublicFormResponse({
        overrides: {
          form: {
            title: 'storybook test orange theme',
            startPage: {
              colorTheme: FormColorTheme.Orange,
            },
          },
        },
        delay: 0,
      }),
    ],
  },
}

export const ColorThemeRed = {
  render: Template,

  parameters: {
    msw: [
      getPublicFormResponse({
        overrides: {
          form: {
            title: 'storybook test red theme',
            startPage: {
              colorTheme: FormColorTheme.Red,
            },
          },
        },
        delay: 0,
      }),
    ],
  },
}

const MiniHeaderTemplate: StoryFn<MiniHeaderProps> = (args) => (
  <MiniHeaderComponent {...args} />
)

export const MiniHeader = {
  render: MiniHeaderTemplate,

  args: {
    title: 'storybook test title',
    titleBg: 'theme-blue.500',
    titleColor: 'white',
    activeSectionId: '1',
    isOpen: true,
  },

  parameters: {
    msw: [getPublicFormResponse()],
  },
}

export const OverflowMiniHeader = {
  render: MiniHeaderTemplate,

  args: {
    ...MiniHeader.args,
    title:
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  },

  parameters: MiniHeader.parameters,
}

export const MiniHeaderMobileWithSections = {
  render: MiniHeaderTemplate,

  args: {
    ...MiniHeader.args,
    title:
      'the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog',
  },

  parameters: {
    ...MiniHeader.parameters,
    ...getMobileViewParameters(),
  },
}

export const MiniHeaderMobileWithoutSections = {
  render: MiniHeaderTemplate,

  args: {
    ...MiniHeader.args,
    activeSectionId: undefined,
  },

  parameters: {
    msw: [
      getPublicFormWithoutSectionsResponse({
        overrides: {
          form: {
            title: 'storybook test title',
          },
        },
        delay: 0,
      }),
    ],
    ...getMobileViewParameters(),
  },
}

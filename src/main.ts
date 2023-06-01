import { templateBuilder } from 'utools-utils/template'
import SearchFeature from '@/features/SearchFeature'
import SettingFeature from '@/features/SettingFeature'
import GeneratorFeature from '@/features/GeneratorFeature'

import './index.scss'

export default templateBuilder()
  .mutableList(new SearchFeature())
  .none(new GeneratorFeature())
  .none(new SettingFeature())
  .build()

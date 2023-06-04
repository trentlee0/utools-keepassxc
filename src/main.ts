import { templateBuilder } from 'utools-utils'
import SearchFeature from '@/features/SearchFeature'
import MatchFeature from './features/MatchFeature'
import SettingFeature from '@/features/SettingFeature'
import GeneratorFeature from '@/features/GeneratorFeature'

import './index.scss'

export default templateBuilder()
  .mutableList(new SearchFeature())
  .mutableList(new MatchFeature())
  .none(new GeneratorFeature())
  .none(new SettingFeature())
  .build()

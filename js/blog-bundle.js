// ============================================
// pixabanimation — Blog Ads Entry Module
// ============================================
// Static blog pages load this single module instead of two separate classic
// scripts. Both ad-injection modules run their own init on import.

import './blog-ads.js';
import { PopupAds } from './popup-ads.js';

window.PopupAds = PopupAds;

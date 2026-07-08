export type BankCategory = 'bank' | 'wallet' | 'psp'

export interface BankDefinition {
  code: string
  label: string
  iconKey: string
  category: BankCategory
  keywords: string[]
}

/** Iranian banks + digital wallets/PSPs — icons from @iran-utils/iranian-banks-react-icons */
export const BANK_CATALOG: BankDefinition[] = [
  // بانک‌ها
  { code: 'melli', label: 'بانک ملی', iconKey: 'Melli', category: 'bank', keywords: ['ملی', 'بانک ملی', 'melli', 'bmi'] },
  { code: 'mellat', label: 'بانک ملت', iconKey: 'Mellat', category: 'bank', keywords: ['ملت', 'بانک ملت', 'mellat'] },
  { code: 'tejarat', label: 'بانک تجارت', iconKey: 'Tejarat', category: 'bank', keywords: ['تجارت', 'بانک تجارت', 'tejarat'] },
  { code: 'saderat', label: 'بانک صادرات', iconKey: 'Saderat', category: 'bank', keywords: ['صادرات', 'بانک صادرات', 'saderat', 'bsi'] },
  { code: 'sepah', label: 'بانک سپه', iconKey: 'Sepah', category: 'bank', keywords: ['سپه', 'بانک سپه', 'sepah'] },
  { code: 'keshavarzi', label: 'بانک کشاورزی', iconKey: 'Keshavarzi', category: 'bank', keywords: ['کشاورزی', 'بانک کشاورزی', 'keshavarzi'] },
  { code: 'maskan', label: 'بانک مسکن', iconKey: 'Maskan', category: 'bank', keywords: ['مسکن', 'بانک مسکن', 'maskan'] },
  { code: 'refah', label: 'بانک رفاه', iconKey: 'Refah', category: 'bank', keywords: ['رفاه', 'بانک رفاه', 'refah'] },
  { code: 'parsian', label: 'بانک پارسیان', iconKey: 'Parsian', category: 'bank', keywords: ['پارسیان', 'بانک پارسیان', 'parsian'] },
  { code: 'pasargad', label: 'بانک پاسارگاد', iconKey: 'Pasargad', category: 'bank', keywords: ['پاسارگاد', 'بانک پاسارگاد', 'pasargad', 'bpi'] },
  { code: 'eghtesad_novin', label: 'بانک اقتصاد نوین', iconKey: 'EghtesadNovin', category: 'bank', keywords: ['اقتصاد نوین', 'نوین', 'eghtesad novin', 'enbank'] },
  { code: 'saman', label: 'بانک سامان', iconKey: 'Saman', category: 'bank', keywords: ['سامان', 'بانک سامان', 'saman'] },
  { code: 'karafarin', label: 'بانک کارآفرین', iconKey: 'Karafarin', category: 'bank', keywords: ['کارآفرین', 'کارافرین', 'karafarin'] },
  { code: 'sina', label: 'بانک سینا', iconKey: 'Sina', category: 'bank', keywords: ['سینا', 'بانک سینا', 'sina'] },
  { code: 'dey', label: 'بانک دی', iconKey: 'Dey', category: 'bank', keywords: ['بانک دی', 'dey'] },
  { code: 'ayandeh', label: 'بانک آینده', iconKey: 'Ayandeh', category: 'bank', keywords: ['آینده', 'بانک آینده', 'ayandeh'] },
  { code: 'iran_zamin', label: 'بانک ایران زمین', iconKey: 'IranZamin', category: 'bank', keywords: ['ایران زمین', 'iran zamin'] },
  { code: 'khavar_mianeh', label: 'بانک خاورمیانه', iconKey: 'KhavarMianeh', category: 'bank', keywords: ['خاورمیانه', 'خاور میانه', 'middle east'] },
  { code: 'gardeshgari', label: 'بانک گردشگری', iconKey: 'Gardeshgari', category: 'bank', keywords: ['گردشگری', 'gardeshgari', 'tourism'] },
  { code: 'sarmayeh', label: 'بانک سرمایه', iconKey: 'Sarmayeh', category: 'bank', keywords: ['سرمایه', 'بانک سرمایه', 'sarmayeh'] },
  { code: 'shahr', label: 'بانک شهر', iconKey: 'Shahr', category: 'bank', keywords: ['بانک شهر', 'شهر', 'shahr'] },
  { code: 'tosee_taavon', label: 'بانک توسعه تعاون', iconKey: 'ToseeTaavon', category: 'bank', keywords: ['توسعه تعاون', 'tosee taavon'] },
  { code: 'resalat', label: 'بانک رسالت', iconKey: 'Resalat', category: 'bank', keywords: ['رسالت', 'بانک رسالت', 'resalat'] },
  { code: 'melall', label: 'بانک ملل', iconKey: 'Melall', category: 'bank', keywords: ['ملل', 'بانک ملل', 'melall'] },
  { code: 'iran_venezuela', label: 'بانک ایران و ونزوئلا', iconKey: 'IranVenezuela', category: 'bank', keywords: ['ونزوئلا', 'venezuela'] },
  { code: 'post', label: 'پست بانک', iconKey: 'Post', category: 'bank', keywords: ['پست بانک', 'post bank', 'postbank'] },
  { code: 'sanat_madan', label: 'بانک صنعت و معدن', iconKey: 'SanatMadan', category: 'bank', keywords: ['صنعت و معدن', 'sanat madan'] },
  { code: 'tosee', label: 'بانک توسعه', iconKey: 'Tosee', category: 'bank', keywords: ['بانک توسعه', 'tosee'] },
  { code: 'tosee_saderat', label: 'بانک توسعه صادرات', iconKey: 'ToseeSaderat', category: 'bank', keywords: ['توسعه صادرات', 'tosee saderat', 'edbi'] },
  { code: 'caspian', label: 'بانک کاسپین', iconKey: 'Caspian', category: 'bank', keywords: ['کاسپین', 'caspian'] },
  { code: 'mehr_iran', label: 'بانک مهر ایران', iconKey: 'MehrIran', category: 'bank', keywords: ['مهر ایران', 'مهر', 'mehr iran'] },
  { code: 'taavon_eslami', label: 'بانک قرض‌الحسنه مهر', iconKey: 'TaavonEslami', category: 'bank', keywords: ['قرض الحسنه مهر', 'taavon eslami'] },
  { code: 'blu_bank', label: 'بلو بانک', iconKey: 'BluBank', category: 'bank', keywords: ['بلو', 'blu', 'blubank'] },
  { code: 'bankino', label: 'بانکینو', iconKey: 'Bankino', category: 'bank', keywords: ['بانکینو', 'bankino'] },
  { code: 'futurebank', label: 'بانک آینده (فیوچر)', iconKey: 'Futurebank', category: 'bank', keywords: ['futurebank', 'فیوچر'] },
  { code: 'noor', label: 'بانک نور', iconKey: 'Noor', category: 'bank', keywords: ['نور', 'بانک نور', 'noor'] },
  { code: 'iran_europe', label: 'بانک ایران و اروپا', iconKey: 'IranEurope', category: 'bank', keywords: ['ایران و اروپا', 'iran europe'] },
  { code: 'standard_chartered', label: 'استاندارد چارترد', iconKey: 'StandardChartered', category: 'bank', keywords: ['standard chartered', 'چارترد'] },
  { code: 'sepah_merged_ansar', label: 'بانک انصار', iconKey: 'SepahMergedAnsar', category: 'bank', keywords: ['انصار', 'بانک انصار', 'ansar'] },
  { code: 'sepah_merged_ghavamin', label: 'بانک قوامین', iconKey: 'SepahMergedGhavamin', category: 'bank', keywords: ['قوامین', 'بانک قوامین', 'ghavamin'] },
  { code: 'sepah_merged_hekmat', label: 'بانک حکمت', iconKey: 'SepahMergedHekmat', category: 'bank', keywords: ['حکمت', 'بانک حکمت', 'hekmat'] },
  { code: 'sepah_merged_kosar', label: 'بانک کوثر', iconKey: 'SepahMergedKosar', category: 'bank', keywords: ['کوثر', 'kosar'] },
  { code: 'sepah_merged_mehr_eghtesad', label: 'بانک مهر اقتصاد', iconKey: 'SepahMergedMehrEghtesad', category: 'bank', keywords: ['مهر اقتصاد', 'mehr eghtesad'] },
  { code: 'bank_markazi', label: 'بانک مرکزی', iconKey: 'BankMarkazi', category: 'bank', keywords: ['بانک مرکزی', 'central bank'] },

  // کیف پول و پرداخت
  { code: 'digipay', label: 'دیجی‌پی', iconKey: 'Digipay', category: 'wallet', keywords: ['دیجی پی', 'دیجی‌پی', 'digipay'] },
  { code: 'idpay', label: 'آیدی‌پی', iconKey: 'Idpay', category: 'wallet', keywords: ['آیدی پی', 'idpay'] },
  { code: 'zibal', label: 'زیبال', iconKey: 'Zibal', category: 'wallet', keywords: ['زیبال', 'zibal'] },
  { code: 'zarrinpal', label: 'زرین‌پال', iconKey: 'Zarrinpal', category: 'wallet', keywords: ['زرین پال', 'زرین‌پال', 'zarrinpal'] },
  { code: 'snapp_pay', label: 'اسنپ‌پی', iconKey: 'SnappPay', category: 'wallet', keywords: ['اسنپ پی', 'اسنپ‌پی', 'snapppay', 'snapp pay'] },
  { code: 'payping', label: 'پی‌پینگ', iconKey: 'Payping', category: 'wallet', keywords: ['پی پینگ', 'payping'] },
  { code: 'nextpay', label: 'نکست‌پی', iconKey: 'NextPay', category: 'wallet', keywords: ['نکست پی', 'nextpay'] },
  { code: 'vandar', label: 'وندار', iconKey: 'Vandar', category: 'wallet', keywords: ['وندار', 'vandar'] },
  { code: 'hesabit', label: 'حسابیت', iconKey: 'Hesabit', category: 'wallet', keywords: ['حسابیت', 'hesabit'] },
  { code: 'pay_ir', label: 'پی‌آی‌آر', iconKey: 'PayIr', category: 'psp', keywords: ['pay.ir', 'pay ir'] },
  { code: 'asan_pardakht', label: 'آسان پرداخت', iconKey: 'AsanPardakht', category: 'psp', keywords: ['آسان پرداخت', 'asan pardakht', 'ap'] },
  { code: 'sadad', label: 'سداد', iconKey: 'Sadad', category: 'psp', keywords: ['سداد', 'sadad', 'mellat psp'] },
  { code: 'saman_kish', label: 'سامان کیش', iconKey: 'SamanKish', category: 'psp', keywords: ['سامان کیش', 'saman kish', 'sep'] },
  { code: 'shaparak', label: 'شاپرک', iconKey: 'Shaparak', category: 'psp', keywords: ['شاپرک', 'shaparak'] },
  { code: 'pasargad_pep', label: 'پاسارگاد PEP', iconKey: 'PasargadPep', category: 'psp', keywords: ['pep', 'پاسارگاد pep'] },
]

const bankByCode = new Map(BANK_CATALOG.map(b => [b.code, b]))

export function getBankByCode(code: string | null | undefined): BankDefinition | undefined {
  if (!code) return undefined
  return bankByCode.get(code)
}

export function banksForAccountType(type: 'BANK' | 'DIGITAL_WALLET' | 'EXCHANGE' | 'CASH' | 'OTHER'): BankDefinition[] {
  if (type === 'DIGITAL_WALLET') {
    return BANK_CATALOG.filter(b => b.category === 'wallet' || b.category === 'psp' || b.code === 'blu_bank' || b.code === 'bankino')
  }
  if (type === 'BANK') {
    return BANK_CATALOG.filter(b => b.category === 'bank')
  }
  return BANK_CATALOG
}

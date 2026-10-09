/**
 * Köy görselleri (atlas, şerit, hesap sahneleri, karakter sayfaları) içerik özetli ad taşımıyor;
 * tarayıcı bunları bir gün önbellekte tutuyor (public/_headers). Görseller değiştiğinde bu sayıyı
 * artır: adres değişince herkes yeni dosyayı alır.
 */
export const ASSET_V = '6';

/** `/assets/...` yoluna sürüm ekler. */
export const v = (url: string) => `${url}?v=${ASSET_V}`;

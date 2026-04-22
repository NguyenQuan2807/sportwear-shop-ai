import { useEffect, useMemo, useState } from "react";

const CACHE_KEY = "vn-address-tree-v1-depth3";
const API_URL = "https://provinces.open-api.vn/api/v1/?depth=3";

const normalizeData = (data) => {
  if (!Array.isArray(data)) return [];

  return data.map((province) => ({
    code: String(province.code),
    name: province.name,
    divisionType: province.division_type,
    districts: Array.isArray(province.districts)
      ? province.districts.map((district) => ({
          code: String(district.code),
          name: district.name,
          divisionType: district.division_type,
          wards: Array.isArray(district.wards)
            ? district.wards.map((ward) => ({
                code: String(ward.code),
                name: ward.name,
                divisionType: ward.division_type,
              }))
            : [],
        }))
      : [],
  }));
};

export default function useVietnamLocations() {
  const [provinces, setProvinces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        setIsLoading(true);
        setError("");

        const cached = window.localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (isMounted) {
            setProvinces(parsed);
            setIsLoading(false);
          }
          return;
        }

        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu tỉnh/thành.");
        }

        const rawData = await response.json();
        const normalized = normalizeData(rawData);

        window.localStorage.setItem(CACHE_KEY, JSON.stringify(normalized));

        if (isMounted) {
          setProvinces(normalized);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || "Đã xảy ra lỗi khi tải dữ liệu địa chỉ.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, []);

  const provinceOptions = provinces;

  const getDistrictsByProvinceCode = (provinceCode) => {
    const province = provinces.find((item) => item.code === String(provinceCode));
    return province?.districts || [];
  };

  const getWardsByDistrictCode = (provinceCode, districtCode) => {
    const districts = getDistrictsByProvinceCode(provinceCode);
    const district = districts.find((item) => item.code === String(districtCode));
    return district?.wards || [];
  };

  const meta = useMemo(
    () => ({
      totalProvinces: provinces.length,
      totalDistricts: provinces.reduce((sum, province) => sum + province.districts.length, 0),
      totalWards: provinces.reduce(
        (sum, province) =>
          sum + province.districts.reduce((subSum, district) => subSum + district.wards.length, 0),
        0
      ),
    }),
    [provinces]
  );

  return {
    provinces: provinceOptions,
    isLoading,
    error,
    getDistrictsByProvinceCode,
    getWardsByDistrictCode,
    meta,
  };
}

import { isErr, safe } from ".";

const result = safe<{ b: string }>(() =>
  JSON.parse(JSON.stringify({ b: "test" }))
);

const safeJsonParse = <T extends object>(d: string) => {
  return safe<T>(() => JSON.parse(d));
};

function init() {
  const result = safeJsonParse<{ b: string }>("");
  if (isErr(result)) {
    console.error("失败:", result.reason, result.stack); // ✅ 默认有 reason
    return;
  }
  console.log("成功:", result.b); // ✅ result 直接是对象
}

init();

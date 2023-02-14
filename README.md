# input-mask-decimal-reverse

```bash
docker run -d --name node-mask --rm -v /root/.ssh:/root/.ssh -v $(pwd):/usr/app -e LANG=C.UTF-8 -w /usr/app node bash
```

```tsx
<InputMaskDecimalReverse
  prefix=""
  suffix=""
  unmask={false}
  scale={2}
  thousandsSeparator="."
  radix=","
  unmaskedRadix="."
/>
```

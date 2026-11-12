<?php $u = current_user(); ?>
<?php if ($u !== null): ?>
    <script>
      // Sesi sebenarnya ada di server (PHP). Dua nilai ini hanya agar penjaga halaman di app.js lolos.
      sessionStorage.setItem("washupRole", <?= json_encode(ucfirst($u['role']), JSON_HEX_TAG | JSON_HEX_AMP) ?>);
      sessionStorage.setItem("washupUsername", <?= json_encode($u['username'], JSON_HEX_TAG | JSON_HEX_AMP) ?>);
    </script>
<?php endif; ?>
    <script src="../../js/app.js"></script>
  </body>
</html>

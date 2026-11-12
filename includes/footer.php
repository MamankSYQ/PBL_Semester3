<?php /** @var string $footerLabel */ ?>
<?php if (($layout ?? 'modern') === 'classic'): ?>
        <footer class="dashboard-footer">
          <span>WASHUP · <?= e($footerLabel) ?></span>
          <span id="current-year"><?= date('Y') ?></span>
        </footer>
<?php else: ?>
        <footer class="dashboard-footer">
          <div class="footer-copy">
            <span class="c-icon-circle">&copy;</span>
            <span id="current-year"><?= date('Y') ?></span> WASHUP - <?= e($footerLabel) ?>
          </div>
          <div class="footer-location"><?= e(APP_LOCATION) ?></div>
        </footer>
<?php endif; ?>
      </div>
    </div>

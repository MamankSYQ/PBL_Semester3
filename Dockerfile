FROM php:8.3-apache

# Install kebutuhan PostgreSQL, ZIP, dan unzip
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    libzip-dev \
    unzip \
    && docker-php-ext-install pdo_pgsql zip \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*

# Atur Apache menggunakan port Render
RUN sed -i 's/Listen 80/Listen 10000/' /etc/apache2/ports.conf \
    && sed -i 's/<VirtualHost \*:80>/<VirtualHost *:10000>/' \
    /etc/apache2/sites-available/000-default.conf

WORKDIR /var/www/html

# Salin Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Instal dependensi PHP
COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --no-progress \
    --optimize-autoloader

# Salin seluruh file aplikasi
COPY . .

# Siapkan folder penyimpanan
RUN mkdir -p uploads/absensi uploads/nota \
    && chown -R www-data:www-data /var/www/html

EXPOSE 10000

CMD ["apache2-foreground"]

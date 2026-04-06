/**
 * Uniform distribution
 */
export function uniform(min: number, max: number, isInteger: boolean = false): number {
    const val = Math.random() * (max - min) + min;
    return isInteger ? Math.floor(val) : val;
}

/**
 * Normal (Gaussian) distribution using Box-Muller transform
 */
export function normal(mean: number, stdDev: number): number {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return num * stdDev + mean;
}

/**
 * Exponential distribution
 */
export function exponential(lambda: number): number {
    return -Math.log(1.0 - Math.random()) / lambda;
}

/**
 * Poisson distribution (Knuth algorithm)
 */
export function poisson(lambda: number): number {
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
        k++;
        p *= Math.random();
    } while (p > L);
    return k - 1;
}

/**
 * Binomial distribution
 */
export function binomial(trials: number, probability: number): number {
    let successes = 0;
    for (let i = 0; i < trials; i++) {
        if (Math.random() < probability) {
            successes++;
        }
    }
    return successes;
}

/**
 * Helper to generate batch of numbers
 */
export function generateBatch(
    type: 'uniform' | 'normal' | 'exponential' | 'poisson' | 'binomial',
    count: number,
    params: any,
    isInteger: boolean = false
): number[] {
    const results: number[] = [];
    for (let i = 0; i < count; i++) {
        let val = 0;
        switch (type) {
            case 'uniform':
                val = uniform(params.min || 0, params.max || 100, isInteger);
                break;
            case 'normal':
                val = normal(params.mean || 0, params.stdDev || 1);
                break;
            case 'exponential':
                val = exponential(params.lambda || 1);
                break;
            case 'poisson':
                val = poisson(params.lambda || 5);
                break;
            case 'binomial':
                val = binomial(params.trials || 10, params.probability || 0.5);
                break;
        }
        
        if (type !== 'uniform' && isInteger) {
            val = Math.round(val);
        }
        
        results.push(val);
    }
    return results;
}
